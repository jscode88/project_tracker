<?php

namespace App\Http\Controllers;

use App\Models\PriceCalculation;
use App\Models\PriceCalculationSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PriceCalculatorController extends Controller
{
    public function index(Request $request)
    {
        $settings = PriceCalculationSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['pricing' => PriceCalculationSetting::DEFAULT_PRICING],
        );

        return Inertia::render('price-calculator', [
            'settings' => array_replace(PriceCalculationSetting::DEFAULT_PRICING, $settings->pricing),
            'calculations' => PriceCalculation::where('user_id', $request->user()->id)->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'inputs' => ['required', 'array'],
            'price_snapshot' => ['required', 'array'],
            'total' => ['required', 'integer', 'min:0'],
        ]);
        $request->user()->priceCalculations()->create($data);

        return to_route('price-calculator.index');
    }

    public function update(Request $request, PriceCalculation $priceCalculation)
    {
        $this->authorizeCalculation($request, $priceCalculation);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'inputs' => ['required', 'array'],
            'price_snapshot' => ['required', 'array'],
            'total' => ['required', 'integer', 'min:0'],
        ]);
        $priceCalculation->update($data);

        return to_route('price-calculator.index');
    }

    public function destroy(Request $request, PriceCalculation $priceCalculation)
    {
        $this->authorizeCalculation($request, $priceCalculation);
        $priceCalculation->delete();

        return to_route('price-calculator.index');
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
