<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectOwnerController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceLogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserGroupController;
use App\Models\Payment;
use App\Models\Project;
use App\Models\ProjectOwner;
use App\Models\Service;
use Illuminate\Support\Facades\Route;

Route::resourceParameters([
    'project-owners' => 'projectOwner',
    'service-logs' => 'serviceLog',
]);

Route::get('/', fn () => auth()->check() ? redirect()->route('dashboard') : redirect()->route('login'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return inertia('dashboard', [
            'stats' => [
                'owners' => ProjectOwner::forCurrentUser()->count(),
                'projects' => Project::forCurrentUser()->count(),
                'activeServices' => Service::forCurrentUser()->where('is_active', true)->count(),
                'balance' => Payment::forCurrentUser()->sum('amount'),
            ],
        ]);
    })->name('dashboard');

    Route::get('price-calculator', fn () => inertia('price-calculator'))->name('price-calculator');

    Route::get('project-owners/{projectOwner}/projects', [ProjectController::class, 'index'])->name('project-owners.projects.index');
    Route::get('projects/{project}/services', [ServiceController::class, 'index'])->name('projects.services.index');
    Route::get('projects/{project}/services/{service}/edit', [ServiceController::class, 'edit'])->name('projects.services.edit');
    Route::get('projects/{project}/payments', [PaymentController::class, 'index'])->name('projects.payments.index');

    Route::resource('project-owners', ProjectOwnerController::class)->except(['show']);
    Route::resource('projects', ProjectController::class)->except(['show']);
    Route::resource('payments', PaymentController::class)->except(['show']);
    Route::resource('services', ServiceController::class)->only(['update']);
    Route::resource('service-logs', ServiceLogController::class)->except(['index', 'show']);
    Route::resource('companies', CompanyController::class)->except(['show']);
    Route::resource('usergroups', UserGroupController::class)->except(['show']);
    Route::resource('users', UserController::class)->except(['show']);
});

require __DIR__.'/settings.php';
