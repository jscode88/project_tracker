<?php

namespace App\Http\Controllers;

use App\Models\Idea;
use App\Models\PriceCalculation;
use App\Models\Problem;
use App\Models\Project;
use App\Models\ProjectOwner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class IdeaController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('ideabook/index', [
            'ideas' => $this->serializedIdeas(),
            'problems' => $this->serializedProblems(),
            'projectOwners' => ProjectOwner::forCurrentUser()->orderBy('name')->get(['id', 'name']),
            'projects' => Project::forCurrentUser()->orderBy('name')->get(['id', 'name', 'owner_id']),
            'availablePriceCalculations' => PriceCalculation::where('user_id', $request->user()->id)
                ->whereNull('problem_id')
                ->latest()
                ->get(['id', 'name', 'total']),
            'selectedEntryId' => $request->integer('entry') ?: null,
        ]);
    }

    public function list(): Response
    {
        return Inertia::render('ideabook/ideas', [
            'ideas' => $this->serializedIdeas(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
            'is_validated' => ['required', 'boolean'],
            'validation_content' => ['nullable', 'string'],
        ]);

        $titleResult = $this->generateTitle(
            $validated['content'],
            'New Solution',
            'Summarize this proposed solution as a short title. Return only the title, maximum 6 words.',
        );

        $request->user()->ideas()->create([
            ...$validated,
            'title' => $titleResult['title'],
        ]);

        return to_route('ideabook.index')->with('ai_title_generation', [
            'failed' => $titleResult['failed'],
            'operation' => 'create',
            'entry_type' => 'solution',
        ]);
    }

    public function update(Request $request, Idea $idea): RedirectResponse
    {
        $this->authorizeIdea($idea);

        $validated = $request->validate([
            'content' => ['required', 'string'],
            'is_validated' => ['required', 'boolean'],
            'validation_content' => ['nullable', 'string'],
            'regenerate_title' => ['sometimes', 'boolean'],
        ]);

        $shouldRegenerateTitle = $validated['regenerate_title'] ?? false;
        $titleResult = $shouldRegenerateTitle
            ? $this->generateTitle(
                $validated['content'],
                'New Solution',
                'Summarize this proposed solution as a short title. Return only the title, maximum 6 words.',
            )
            : ['title' => $idea->title, 'failed' => false];

        $idea->update([
            'content' => $validated['content'],
            'is_validated' => $validated['is_validated'],
            'validation_content' => $validated['validation_content'] ?? null,
            'title' => $titleResult['title'],
        ]);

        return to_route('ideabook.index')->with('ai_title_generation', [
            'failed' => $titleResult['failed'],
            'operation' => $shouldRegenerateTitle ? 'update' : null,
            'entry_type' => 'solution',
        ]);
    }

    public function destroy(Idea $idea): RedirectResponse
    {
        $this->authorizeIdea($idea);
        $idea->delete();

        return to_route('ideabook.index');
    }

    private function serializedIdeas(): array
    {
        return Idea::forCurrentUser()
            ->latest('created_at')
            ->get()
            ->map(fn (Idea $idea) => [
                'id' => $idea->id,
                'title' => $idea->title,
                'content' => $idea->content,
                'is_validated' => $idea->is_validated,
                'validation_content' => $idea->validation_content,
                'created_at' => $idea->created_at?->toISOString(),
                'updated_at' => $idea->updated_at?->toISOString(),
            ])
            ->all();
    }

    private function serializedProblems(): array
    {
        return Problem::forCurrentUser()
            ->with([
                'idea:id,title',
                'projectOwner:id,name',
                'project:id,name',
                'priceCalculations:id,problem_id,name,total,created_at',
            ])
            ->latest('created_at')
            ->get()
            ->map(fn (Problem $problem) => [
                'id' => $problem->id,
                'idea_id' => $problem->idea_id,
                'idea_title' => $problem->idea?->title,
                'entry_type' => $problem->entry_type,
                'status' => $problem->status,
                'project_owner_id' => $problem->project_owner_id,
                'project_owner_name' => $problem->projectOwner?->name,
                'project_id' => $problem->project_id,
                'project_name' => $problem->project?->name,
                'customer_name' => $problem->customer_name,
                'contact_person' => $problem->contact_person,
                'contact_method' => $problem->contact_method,
                'enquiry_source' => $problem->enquiry_source,
                'expected_budget' => $problem->expected_budget,
                'expected_budget_currency' => $problem->expected_budget_currency,
                'desired_delivery_date' => $problem->desired_delivery_date?->toDateString(),
                'follow_up_date' => $problem->follow_up_date?->toDateString(),
                'next_action' => $problem->next_action,
                'price_calculations' => $problem->priceCalculations->map(fn (PriceCalculation $calculation) => [
                    'id' => $calculation->id,
                    'name' => $calculation->name,
                    'total' => $calculation->total,
                    'created_at' => $calculation->created_at?->toISOString(),
                ])->values(),
                'title' => $problem->title,
                'content' => $problem->content,
                'validation_content' => $problem->validation_content,
                'created_at' => $problem->created_at?->toISOString(),
                'updated_at' => $problem->updated_at?->toISOString(),
            ])
            ->all();
    }

    private function generateTitle(string $content, string $fallbackTitle, string $instruction): array
    {
        $fallbackResult = [
            'title' => $fallbackTitle,
            'failed' => true,
        ];

        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-2.5-flash-lite');

        if (! is_string($apiKey) || $apiKey === '' || ! is_string($model) || $model === '') {
            return $fallbackResult;
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders(['x-goog-api-key' => $apiKey])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $instruction."\n\n".$content],
                            ],
                        ],
                    ],
                ]);
        } catch (Throwable $exception) {
            Log::error('Failed to generate IdeaBook title.', [
                'fallback_title' => $fallbackTitle,
                'exception' => $exception->getMessage(),
            ]);

            return $fallbackResult;
        }

        if (! $response->successful()) {
            Log::error('Failed to generate IdeaBook title.', [
                'fallback_title' => $fallbackTitle,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $fallbackResult;
        }

        $title = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (! is_string($title) || trim($title) === '') {
            return $fallbackResult;
        }

        $title = trim(preg_replace('/\s+/', ' ', $title) ?? $fallbackTitle);
        $title = trim($title, " \t\n\r\0\x0B\"'`");

        return [
            'title' => mb_substr($title !== '' ? $title : $fallbackTitle, 0, 255),
            'failed' => false,
        ];
    }

    private function authorizeIdea(Idea $idea): void
    {
        abort_unless($idea->user_id === auth()->id(), 404);
    }
}
