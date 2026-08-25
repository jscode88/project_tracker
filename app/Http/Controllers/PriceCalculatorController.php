<?php

namespace App\Http\Controllers;

use App\Models\PriceCalculation;
use App\Models\PriceCalculationSetting;
use App\Models\Problem;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PriceCalculatorController extends Controller
{
    public function index(Request $request)
    {
        return $this->renderCalculator($request);
    }

    public function saved(Request $request)
    {
        return $this->renderCalculator($request, view: 'saved');
    }

    public function settings(Request $request)
    {
        return $this->renderCalculator($request, view: 'settings');
    }

    public function show(Request $request, PriceCalculation $priceCalculation)
    {
        $this->authorizeCalculation($request, $priceCalculation);

        return $this->renderCalculator($request, $priceCalculation);
    }

    private function renderCalculator(
        Request $request,
        ?PriceCalculation $selectedCalculation = null,
        string $view = 'calculator',
    ) {
        $enquiry = $selectedCalculation?->problem;

        if (! $enquiry && $request->integer('enquiry_id')) {
            $enquiry = Problem::forCurrentUser()
                ->where('entry_type', 'enquiry')
                ->findOrFail($request->integer('enquiry_id'));
        }

        $enquiry?->loadMissing('idea:id,content');

        $settings = PriceCalculationSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['pricing' => PriceCalculationSetting::DEFAULT_PRICING],
        );

        return Inertia::render('price-calculator', [
            'settings' => array_replace(PriceCalculationSetting::DEFAULT_PRICING, $settings->pricing),
            'calculations' => PriceCalculation::where('user_id', $request->user()->id)
                ->with(['project', 'problem:id,title,customer_name'])
                ->latest()
                ->get(),
            'projects' => Project::forCurrentUser()->orderBy('name')->get(),
            'selectedCalculationId' => $selectedCalculation?->id,
            'view' => $view,
            'enquiry' => $enquiry ? [
                'id' => $enquiry->id,
                'title' => $enquiry->title,
                'customer_name' => $enquiry->customer_name,
                'project_id' => $enquiry->project_id,
                'content' => $enquiry->content,
                'proposed_solution' => $enquiry->idea?->content,
                'expected_budget' => $enquiry->expected_budget,
                'expected_budget_currency' => $enquiry->expected_budget_currency,
                'desired_delivery_date' => $enquiry->desired_delivery_date?->toDateString(),
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'inputs' => ['required', 'array'],
            'price_snapshot' => ['required', 'array'],
            'total' => ['required', 'integer', 'min:0'],
            'project_id' => [
                'nullable',
                Rule::exists('projects', 'id')->where('user_id', $request->user()->id),
            ],
            'problem_id' => [
                'nullable',
                Rule::exists('problems', 'id')
                    ->where('user_id', $request->user()->id)
                    ->where('entry_type', 'enquiry'),
            ],
        ]);
        $request->user()->priceCalculations()->create($data);

        return to_route('price-calculator.index', array_filter([
            'enquiry_id' => $data['problem_id'] ?? null,
        ]));
    }

    public function update(Request $request, PriceCalculation $priceCalculation)
    {
        $this->authorizeCalculation($request, $priceCalculation);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'inputs' => ['required', 'array'],
            'price_snapshot' => ['required', 'array'],
            'total' => ['required', 'integer', 'min:0'],
            'project_id' => [
                'nullable',
                Rule::exists('projects', 'id')->where('user_id', $request->user()->id),
            ],
            'problem_id' => [
                'nullable',
                Rule::exists('problems', 'id')
                    ->where('user_id', $request->user()->id)
                    ->where('entry_type', 'enquiry'),
            ],
        ]);
        $priceCalculation->update($data);

        return to_route('price-calculator.index', array_filter([
            'enquiry_id' => $data['problem_id'] ?? null,
        ]));
    }

    public function destroy(Request $request, PriceCalculation $priceCalculation)
    {
        $this->authorizeCalculation($request, $priceCalculation);
        $priceCalculation->delete();

        return to_route('price-calculator.saved');
    }

    public function updateSettings(Request $request)
    {
        $pricing = $request->validate(['pricing' => ['required', 'array']])['pricing'];
        $allowed = array_keys(PriceCalculationSetting::DEFAULT_PRICING);
        abort_unless(array_keys($pricing) === $allowed, 422);
        foreach ($pricing as $value) {
            abort_unless(is_numeric($value) && (float) $value >= 0, 422);
        }

        PriceCalculationSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['pricing' => array_map('floatval', $pricing)],
        );

        return to_route('price-calculator.index');
    }

    private function authorizeCalculation(Request $request, PriceCalculation $priceCalculation): void
    {
        abort_unless($priceCalculation->user_id === $request->user()->id, 404);
    }
}
