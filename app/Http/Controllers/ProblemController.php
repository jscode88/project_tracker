<?php

namespace App\Http\Controllers;

use App\Models\PriceCalculation;
use App\Models\Problem;
use App\Models\Project;
use App\Models\ProjectOwner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProblemController extends Controller
{
    private const PROBLEM_STATUSES = ['open', 'investigating', 'solution_drafted', 'testing', 'resolved', 'closed'];

    private const ENQUIRY_STATUSES = ['new_enquiry', 'discovery', 'proposal_drafted', 'proposal_sent', 'won', 'lost'];

    public function list(): Response
    {
        return Inertia::render('ideabook/problems', [
            'problems' => $this->serializedProblems(),
        ]);
    }

    public function pipeline(): Response
    {
        return Inertia::render('ideabook/pipeline', [
            'enquiries' => array_values(array_filter(
                $this->serializedProblems(),
                fn (array $entry) => $entry['entry_type'] === 'enquiry',
            )),
        ]);
    }

    public function storeProjectOwner(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:255'],
        ]);

        $normalizedName = mb_strtolower(trim($validated['name']));
        $owner = ProjectOwner::forCurrentUser()
            ->whereRaw('LOWER(name) = ?', [$normalizedName])
            ->first();

        if (! $owner) {
            $owner = ProjectOwner::create([
                ...$validated,
                'name' => trim($validated['name']),
                'user_id' => $request->user()->id,
            ]);
        }

        return to_route('ideabook.index')->with('created_project_owner_id', $owner->id);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedEntry($request);
        $isEnquiry = $validated['entry_type'] === 'enquiry';

        $manualTitle = trim($validated['title'] ?? '');
        $titleResult = $manualTitle !== ''
            ? ['title' => $manualTitle, 'failed' => false]
            : $this->generateTitle(
                $validated['content'],
                $isEnquiry ? 'New Customer Enquiry' : 'New Problem',
                $isEnquiry
                    ? 'Summarize this customer enquiry as a short title. Focus on the customer need or desired outcome. Return only the title, maximum 6 words.'
                    : 'Create a short title for this problem. Return only the title, maximum 6 words.',
            );

        unset($validated['regenerate_title'], $validated['title']);

        $request->user()->problems()->create([
            ...$validated,
            'title' => $titleResult['title'],
        ]);

        return to_route('ideabook.index')->with('ai_title_generation', [
            'failed' => $titleResult['failed'],
            'operation' => 'create',
            'entry_type' => $isEnquiry ? 'enquiry' : 'problem',
        ]);
    }

    public function update(Request $request, Problem $problem): RedirectResponse
    {
        $this->authorizeProblem($problem);

        $validated = $this->validatedEntry($request);

        $shouldRegenerateTitle = $validated['regenerate_title'] ?? false;
        $isEnquiry = $validated['entry_type'] === 'enquiry';
        $titleResult = $shouldRegenerateTitle
            ? $this->generateTitle(
                $validated['content'],
                $isEnquiry ? 'New Customer Enquiry' : 'New Problem',
                $isEnquiry
                    ? 'Summarize this customer enquiry as a short title. Focus on the customer need or desired outcome. Return only the title, maximum 6 words.'
                    : 'Create a short title for this problem. Return only the title, maximum 6 words.',
            )
            : ['title' => trim($validated['title'] ?? '') ?: $problem->title, 'failed' => false];

        unset($validated['regenerate_title'], $validated['title']);

        $problem->update([
            ...$validated,
            'title' => $titleResult['title'],
        ]);

        return to_route('ideabook.index')->with('ai_title_generation', [
            'failed' => $titleResult['failed'],
            'operation' => $shouldRegenerateTitle ? 'update' : null,
            'entry_type' => $isEnquiry ? 'enquiry' : 'problem',
        ]);
    }

    public function destroy(Problem $problem): RedirectResponse
    {
        $this->authorizeProblem($problem);
        $problem->delete();

        return to_route('ideabook.index');
    }

    public function linkIdea(Request $request, Problem $problem): RedirectResponse
    {
        $this->authorizeProblem($problem);

        $validated = $request->validate([
            'idea_id' => [
                'required',
                'integer',
                Rule::exists('ideas', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        $problem->update([
            'idea_id' => $validated['idea_id'],
            'status' => $this->draftedStatus($problem),
        ]);

        return to_route('ideabook.index');
    }

    public function createLinkedIdea(Request $request, Problem $problem): RedirectResponse
    {
        $this->authorizeProblem($problem);

        $validated = $request->validate([
            'content' => ['required', 'string'],
            'validation_content' => ['nullable', 'string'],
        ]);

        $titleResult = $this->generateTitle(
            $validated['content'],
            'New Solution',
            'Summarize this proposed solution as a short title. Return only the title, maximum 6 words.',
        );

        $idea = $request->user()->ideas()->create([
            'title' => $titleResult['title'],
            'content' => $validated['content'],
            'is_validated' => false,
            'validation_content' => $validated['validation_content'] ?? null,
        ]);

        $problem->update([
            'idea_id' => $idea->id,
            'status' => $this->draftedStatus($problem),
        ]);

        return to_route('ideabook.index')->with('ai_title_generation', [
            'failed' => $titleResult['failed'],
            'operation' => 'create',
            'entry_type' => 'solution',
        ]);
    }

    public function linkPriceCalculation(Problem $problem, PriceCalculation $priceCalculation): RedirectResponse
    {
        $this->authorizeProblem($problem);
        $this->authorizePriceCalculation($priceCalculation);
        abort_unless($problem->entry_type === 'enquiry', 422);
        abort_if(
            $priceCalculation->problem_id !== null && $priceCalculation->problem_id !== $problem->id,
            422,
        );

        $priceCalculation->update(['problem_id' => $problem->id]);

        return to_route('ideabook.index', ['entry' => $problem->id]);
    }

    public function unlinkPriceCalculation(Problem $problem, PriceCalculation $priceCalculation): RedirectResponse
    {
        $this->authorizeProblem($problem);
        $this->authorizePriceCalculation($priceCalculation);
        abort_unless($priceCalculation->problem_id === $problem->id, 404);

        $priceCalculation->update(['problem_id' => null]);

        return to_route('ideabook.index', ['entry' => $problem->id]);
    }

    private function serializedProblems(): array
    {
        return Problem::forCurrentUser()
            ->with(['idea:id,title', 'projectOwner:id,name', 'project:id,name'])
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
                'title' => $problem->title,
                'content' => $problem->content,
                'validation_content' => $problem->validation_content,
                'created_at' => $problem->created_at?->toISOString(),
                'updated_at' => $problem->updated_at?->toISOString(),
            ])
            ->all();
    }

    private function validatedEntry(Request $request): array
    {
        $statusOptions = $request->string('entry_type')->toString() === 'enquiry'
            ? self::ENQUIRY_STATUSES
            : self::PROBLEM_STATUSES;

        $validated = $request->validate([
            'entry_type' => ['required', Rule::in(['problem', 'enquiry'])],
            'status' => ['required', Rule::in($statusOptions)],
            'project_owner_id' => [
                'required_if:entry_type,enquiry',
                'nullable',
                Rule::exists('project_owners', 'id')->where('user_id', $request->user()->id),
            ],
            'project_id' => [
                'nullable',
                Rule::exists('projects', 'id')->where('user_id', $request->user()->id),
            ],
            'customer_name' => ['required_if:entry_type,enquiry', 'nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_method' => ['nullable', 'string', 'max:255'],
            'enquiry_source' => ['nullable', 'string', 'max:255'],
            'expected_budget' => ['nullable', 'numeric', 'min:0'],
            'expected_budget_currency' => ['nullable', 'string', 'size:3', 'regex:/^[A-Za-z]{3}$/'],
            'desired_delivery_date' => ['nullable', 'date'],
            'follow_up_date' => ['nullable', 'date'],
            'next_action' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'validation_content' => ['nullable', 'string'],
            'regenerate_title' => ['sometimes', 'boolean'],
        ]);

        if ($validated['entry_type'] === 'problem') {
            $validated['project_owner_id'] = null;
            $validated['project_id'] = null;
            $validated['customer_name'] = null;
            $validated['contact_person'] = null;
            $validated['contact_method'] = null;
            $validated['enquiry_source'] = null;
            $validated['expected_budget'] = null;
            $validated['expected_budget_currency'] = null;
            $validated['desired_delivery_date'] = null;
            $validated['follow_up_date'] = null;
            $validated['next_action'] = null;
        }

        if (! empty($validated['project_id'])) {
            $project = Project::forCurrentUser()->findOrFail($validated['project_id']);
            $validated['project_owner_id'] = $project->owner_id;
        }

        if ($validated['entry_type'] === 'enquiry' && ! empty($validated['project_owner_id'])) {
            $owner = ProjectOwner::forCurrentUser()->findOrFail($validated['project_owner_id']);
            $validated['customer_name'] = $owner->name;
            $validated['contact_person'] = $owner->name;
        }

        return $validated;
    }

    private function draftedStatus(Problem $problem): string
    {
        if ($problem->entry_type === 'enquiry') {
            return in_array($problem->status, ['new_enquiry', 'discovery'], true)
                ? 'proposal_drafted'
                : $problem->status;
        }

        return in_array($problem->status, ['open', 'investigating'], true)
            ? 'solution_drafted'
            : $problem->status;
    }

    private function authorizePriceCalculation(PriceCalculation $priceCalculation): void
    {
        abort_unless($priceCalculation->user_id === auth()->id(), 404);
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

    private function authorizeProblem(Problem $problem): void
    {
        abort_unless($problem->user_id === auth()->id(), 404);
    }
}
