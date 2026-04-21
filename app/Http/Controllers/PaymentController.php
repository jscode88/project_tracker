<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request, ?Project $project = null)
    {
        if (! $request->has('year')) {
            return redirect()->to($request->fullUrlWithQuery(['year' => now()->year]));
        }

        $selectedYear = $request->query('year', now()->year);
        $selectedYear = $selectedYear === 'all' ? 'all' : (int) $selectedYear;

        $base = Payment::forCurrentUser()
            ->with('project')
            ->when($project?->id, fn ($query) => $query->where('project_id', $project->id))
            ->when($selectedYear !== 'all', fn ($query) => $query->whereYear('date', $selectedYear));

        $years = Payment::forCurrentUser()
            ->when($project?->id, fn ($query) => $query->where('project_id', $project->id))
            ->selectRaw('YEAR(date) as year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($year) => (int) $year)
            ->values();

        return Inertia::render('payments/index', [
            'payments' => (clone $base)->orderByDesc('date')->paginate(10)->withQueryString(),
            'summary' => (clone $base)
                ->selectRaw('project_id, currency, SUM(amount) as amount')
                ->groupBy('project_id', 'currency')
                ->with('project')
                ->orderByDesc('amount')
                ->get(),
            'project' => $project,
            'years' => $years,
            'selectedYear' => $selectedYear,
        ]);
    }

    public function create(Request $request)
    {
        $this->rememberFormOrigin($request);

        return Inertia::render('payments/form', [
            'payment' => null,
            'projects' => Project::forCurrentUser()->where('is_active', true)->orderBy('name')->get(),
            'selectedProject' => $request->integer('project_id') ?: null,
        ]);
    }

    public function store(Request $request)
    {
        Payment::create($this->payload($request) + ['user_id' => $request->user()->id]);

        return $this->redirectToFormOrigin(route('payments.index'));
    }

    public function edit(Request $request, Payment $payment)
    {
        $this->authorizePayment($payment);
        $this->rememberFormOrigin($request);

        return Inertia::render('payments/form', [
            'payment' => $payment,
            'projects' => Project::forCurrentUser()
                ->where(fn ($query) => $query->where('is_active', true)->orWhere('id', $payment->project_id))
                ->orderBy('name')
                ->get(),
            'selectedProject' => null,
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $this->authorizePayment($payment);
        $payment->update($this->payload($request));

        return $this->redirectToFormOrigin(route('payments.index'));
    }

    public function destroy(Payment $payment)
    {
        $this->authorizePayment($payment);
        $payment->delete();

        return to_route('payments.index');
    }

    private function payload(Request $request): array
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
            'is_expense' => ['boolean'],
        ]);

        $project = Project::forCurrentUser()->findOrFail($data['project_id']);
        $data['owner_id'] = $project->owner_id;
        $data['currency'] ??= 'IDR';
        $data['amount'] = (int) $data['amount'] * ($request->boolean('is_expense') ? -1 : 1);
        unset($data['is_expense']);

        return $data;
    }

    private function authorizePayment(Payment $payment): void
    {
        abort_unless($payment->user_id === auth()->id(), 404);
    }
}
