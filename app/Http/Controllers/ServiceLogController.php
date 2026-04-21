<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ServiceLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceLogController extends Controller
{
    public function create(Request $request)
    {
        $this->rememberFormOrigin($request);

        return Inertia::render('service-logs/form', [
            'serviceLog' => null,
            'projects' => Project::forCurrentUser()->orderBy('name')->get(),
            'selectedProject' => $request->integer('project_id') ?: null,
        ]);
    }

    public function store(Request $request)
    {
        ServiceLog::create($this->payload($request) + ['user_id' => $request->user()->id]);

        return $this->redirectToFormOrigin(route('projects.services.index', $request->integer('project_id')));
    }

    public function edit(Request $request, ServiceLog $serviceLog)
    {
        abort_unless($serviceLog->user_id === auth()->id(), 404);
        $this->rememberFormOrigin($request);

        return Inertia::render('service-logs/form', [
            'serviceLog' => $serviceLog,
            'projects' => Project::forCurrentUser()->orderBy('name')->get(),
            'selectedProject' => null,
        ]);
    }

    public function update(Request $request, ServiceLog $serviceLog)
    {
        abort_unless($serviceLog->user_id === auth()->id(), 404);
        $serviceLog->update($this->payload($request));

        return $this->redirectToFormOrigin(route('projects.services.index', $serviceLog->project_id));
    }

    public function destroy(ServiceLog $serviceLog)
    {
        abort_unless($serviceLog->user_id === auth()->id(), 404);
        $projectId = $serviceLog->project_id;
        $serviceLog->delete();

        return to_route('projects.services.index', $projectId);
    }

    private function payload(Request $request): array
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $project = Project::forCurrentUser()->findOrFail($data['project_id']);
        $data['owner_id'] = $project->owner_id;

        return $data;
    }
}
