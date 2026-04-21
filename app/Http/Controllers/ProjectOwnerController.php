<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Project;
use App\Models\ProjectOwner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectOwnerController extends Controller
{
    public function index(Request $request)
    {
        $query = ProjectOwner::forCurrentUser()
            ->addSelect([
                'total_projects' => Project::query()
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('owner_id', 'project_owners.id'),
                'total_payment' => Payment::query()
                    ->selectRaw('COALESCE(SUM(amount), 0)')
                    ->whereColumn('owner_id', 'project_owners.id'),
            ])
            ->when($request->string('search')->toString(), fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderByDesc('total_payment');

        return Inertia::render('project-owners/index', [
            'owners' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create(Request $request)
    {
        $this->rememberFormOrigin($request);

        return Inertia::render('project-owners/form', ['owner' => null]);
    }

    public function store(Request $request)
    {
        ProjectOwner::create($this->validated($request) + ['user_id' => $request->user()->id]);

        return $this->redirectToFormOrigin(route('project-owners.index'));
    }

    public function edit(Request $request, ProjectOwner $projectOwner)
    {
        abort_unless($projectOwner->user_id === auth()->id(), 404);
        $this->rememberFormOrigin($request);

        return Inertia::render('project-owners/form', ['owner' => $projectOwner]);
    }

    public function update(Request $request, ProjectOwner $projectOwner)
    {
        abort_unless($projectOwner->user_id === auth()->id(), 404);
        $projectOwner->update($this->validated($request));

        return $this->redirectToFormOrigin(route('project-owners.index'));
    }

    public function destroy(ProjectOwner $projectOwner)
    {
        abort_unless($projectOwner->user_id === auth()->id(), 404);
        $projectOwner->delete();

        return to_route('project-owners.index');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
