<?php

namespace App\Http\Controllers;

use App\Models\PriceComparison;
use App\Models\RateCard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PriceComparisonController extends Controller
{
    public function index()
    {
        $comparisons = PriceComparison::with(['user', 'rateCard'])
            ->latest()
            ->paginate(10);

        return Inertia::render('PriceComparisons/Index', [
            'comparisons' => $comparisons,
        ]);
    }

    public function show(PriceComparison $priceComparison)
    {
        $priceComparison->load(['user', 'rateCard', 'items']);

        return Inertia::render('PriceComparisons/Show', [
            'comparison' => $priceComparison,
        ]);
    }

    public function create()
    {
        $rateCards = RateCard::where('is_active', true)->get();

        return Inertia::render('PriceComparisons/Create', [
            'rateCards' => $rateCards,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rate_card_id' => 'required|exists:rate_cards,id',
            'login_id' => 'required|string|unique:price_comparisons',
            'our_price' => 'required|numeric|min:0',
            'competitor_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';

        if ($validated['competitor_price'] ?? null) {
            $validated['price_difference'] = $validated['our_price'] - $validated['competitor_price'];
        }

        $comparison = PriceComparison::create($validated);

        return redirect()->route('price-comparisons.show', $comparison)
            ->with('success', 'Price comparison created successfully.');
    }

    public function edit(PriceComparison $priceComparison)
    {
        $rateCards = RateCard::where('is_active', true)->get();

        return Inertia::render('PriceComparisons/Edit', [
            'comparison' => $priceComparison,
            'rateCards' => $rateCards,
        ]);
    }

    public function update(Request $request, PriceComparison $priceComparison)
    {
        $validated = $request->validate([
            'rate_card_id' => 'required|exists:rate_cards,id',
            'competitor_price' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,active,archived',
            'notes' => 'nullable|string',
        ]);

        if ($validated['competitor_price'] ?? null) {
            $validated['price_difference'] = $priceComparison->our_price - $validated['competitor_price'];
        }

        $priceComparison->update($validated);

        return redirect()->route('price-comparisons.show', $priceComparison)
            ->with('success', 'Price comparison updated successfully.');
    }

    public function destroy(PriceComparison $priceComparison)
    {
        $priceComparison->delete();

        return redirect()->route('price-comparisons.index')
            ->with('success', 'Price comparison deleted successfully.');
    }
}
