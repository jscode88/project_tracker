<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Project;
use App\Models\Service;
use App\Models\ServiceLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Project $project)
    {
        abort_unless($project->user_id === auth()->id(), 404);

        return Inertia::render('services/index', [
            'project' => $project->load('owner'),
            'services' => Service::forCurrentUser()->where('project_id', $project->id)->orderBy('type')->get(),
            'payments' => Payment::forCurrentUser()->where('project_id', $project->id)->where('amount', '>', 0)->orderByDesc('date')->paginate(10)->withQueryString(),
            'expenses' => Payment::forCurrentUser()->where('project_id', $project->id)->where('amount', '<', 0)->orderByDesc('date')->paginate(10)->withQueryString(),
            'logs' => ServiceLog::forCurrentUser()->where('project_id', $project->id)->orderByDesc('date')->paginate(10)->withQueryString(),
        ]);
    }

    public function edit(Project $project, Service $service)
    {
        abort_unless($project->user_id === auth()->id() && $service->project_id === $project->id, 404);
        $this->rememberFormOrigin(request());

        return Inertia::render('services/form', [
            'project' => $project,
            'service' => $service,
        ]);
    }

    public function update(Request $request, Service $service)
    {
        abort_unless($service->user_id === auth()->id(), 404);

        $service->update($request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
            'currency' => ['required', 'string', 'max:10'],
            'amount' => ['required', 'numeric'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]));

        return $this->redirectToFormOrigin(route('projects.services.index', $service->project_id));
    }
}
