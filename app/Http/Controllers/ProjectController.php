<?php

namespace App\Http\Controllers;

use App\Models\PriceCalculation;
use App\Models\Project;
use App\Models\ProjectOwner;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProjectController extends Controller
{
    private const DEFAULT_SERVICES = ['Maintenance', 'SEO', 'Domain', 'Hosting'];

    public function index(Request $request, ?ProjectOwner $projectOwner = null)
    {
        $query = Project::forCurrentUser()
            ->with(['owner', 'priceCalculations'])
            ->when($projectOwner?->id, fn ($query) => $query->where('owner_id', $projectOwner->id))
            ->when($request->string('search')->toString(), function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('referrer', 'like', "%{$search}%")
                        ->orWhere('url', 'like', "%{$search}%")
                        ->orWhereHas('owner', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest();

        return Inertia::render('projects/index', [
            'projects' => $query->paginate(10)->withQueryString(),
            'owner' => $projectOwner,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(Request $request)
    {
        $this->rememberFormOrigin($request);

        return Inertia::render('projects/form', [
            'project' => null,
            'owners' => ProjectOwner::forCurrentUser()->orderBy('name')->get(),
            'priceCalculations' => PriceCalculation::where('user_id', $request->user()->id)
                ->whereNull('project_id')
                ->latest()
                ->get(),
            'selectedOwner' => $request->integer('owner_id') ?: null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $priceCalculationIds = $data['price_calculation_ids'] ?? [];
        unset($data['price_calculation_ids']);

        $project = Project::create($data + ['user_id' => $request->user()->id]);
        $this->syncPriceCalculations($project, $priceCalculationIds);
        $this->ensureDefaultServices($project);

        return $this->redirectToFormOrigin(route('projects.index'));
    }

    public function edit(Request $request, Project $project)
    {
        $this->authorizeProject($project);
        $this->rememberFormOrigin($request);

        return Inertia::render('projects/form', [
            'project' => $project->load('priceCalculations'),
            'owners' => ProjectOwner::forCurrentUser()->orderBy('name')->get(),
            'priceCalculations' => PriceCalculation::where('user_id', $request->user()->id)
                ->where(fn ($query) => $query->whereNull('project_id')->orWhere('project_id', $project->id))
                ->latest()
                ->get(),
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorizeProject($project);
        $data = $this->validated($request);
        $priceCalculationIds = $data['price_calculation_ids'] ?? [];
        unset($data['price_calculation_ids']);

        $project->update($data);
        $this->syncPriceCalculations($project, $priceCalculationIds);
        $this->ensureDefaultServices($project->refresh());

        return $this->redirectToFormOrigin(route('projects.index'));
    }

    public function destroy(Project $project)
    {
        $this->authorizeProject($project);
        $project->delete();

        return to_route('projects.index');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'max:255'],
            'owner_id' => ['required', 'exists:project_owners,id'],
            'url' => ['nullable', 'string', 'max:255'],
            'referrer' => ['nullable', 'string', 'max:255'],
            'commission_fee' => ['nullable', 'numeric'],
            'is_active' => ['boolean'],
            'price_calculation_ids' => ['array'],
            'price_calculation_ids.*' => [
                Rule::exists('price_calculations', 'id')->where('user_id', $request->user()->id),
            ],
        ]);
    }

    private function syncPriceCalculations(Project $project, array $priceCalculationIds): void
    {
        PriceCalculation::where('user_id', $project->user_id)
            ->where('project_id', $project->id)
            ->when($priceCalculationIds !== [], fn ($query) => $query->whereNotIn('id', $priceCalculationIds))
            ->update(['project_id' => null]);

        if ($priceCalculationIds === []) {
            return;
        }

        PriceCalculation::where('user_id', $project->user_id)
            ->whereIn('id', $priceCalculationIds)
            ->update(['project_id' => $project->id]);
    }

    private function ensureDefaultServices(Project $project): void
    {
        foreach (self::DEFAULT_SERVICES as $type) {
            Service::firstOrCreate(
                ['project_id' => $project->id, 'type' => $type],
                [
                    'user_id' => $project->user_id,
                    'owner_id' => $project->owner_id,
                    'start_date' => now()->toDateString(),
                    'end_date' => now()->toDateString(),
                    'currency' => 'IDR',
                    'amount' => 0,
                    'notes' => '',
                    'is_active' => false,
                ],
            );
        }
    }

    private function authorizeProject(Project $project): void
    {
        abort_unless($project->user_id === auth()->id(), 404);
    }
}
