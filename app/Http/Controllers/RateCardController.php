<?php

namespace App\Http\Controllers;

use App\Models\RateCard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RateCardController extends Controller
{
    public function index()
    {
        $rateCards = RateCard::with('charges', 'role')
            ->when(request('search'), function ($query) {
                return $query->where('name', 'like', '%'.request('search').'%')
                    ->orWhere('origin_country', 'like', '%'.request('search').'%')
                    ->orWhere('destination_country', 'like', '%'.request('search').'%');
            })
            ->when(request('status'), function ($query) {
                return $query->where('status', request('status'));
            })
            ->when(request('service_type'), function ($query) {
                return $query->where('service_type', request('service_type'));
            })
            ->paginate(request('per_page', 50));

        return Inertia::render('RateCards/Index', [
            'rateCards' => $rateCards,
            'filters' => request()->only(['search', 'status', 'service_type', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('RateCards/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:rate_cards|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'service_type' => 'required|in:standard,express,overnight,economy',
            'origin_country' => 'required|string|max:100',
            'destination_country' => 'required|string|max:100',
            'base_rate' => 'required|numeric|min:0',
            'minimum_charge' => 'required|numeric|min:0',
            'surcharge_percentage' => 'required|numeric|min:0|max:100',
            'is_zone_based' => 'boolean',
            'valid_days' => 'required|integer|min:1',
        ]);

        $validated['slug'] = str($validated['name'])->slug();

        RateCard::create($validated);

        return redirect()->route('rate-cards.index')->with('success', 'Rate card created successfully');
    }

    public function show(RateCard $rateCard)
    {
        $rateCard->load('charges');

        return Inertia::render('RateCards/Show', [
            'rateCard' => $rateCard,
        ]);
    }

    public function edit(RateCard $rateCard)
    {
        return Inertia::render('RateCards/Edit', [
            'rateCard' => $rateCard->load('charges'),
        ]);
    }

    public function update(Request $request, RateCard $rateCard)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:rate_cards,name,'.$rateCard->id.'|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'service_type' => 'required|in:standard,express,overnight,economy',
            'origin_country' => 'required|string|max:100',
            'destination_country' => 'required|string|max:100',
            'base_rate' => 'required|numeric|min:0',
            'minimum_charge' => 'required|numeric|min:0',
            'surcharge_percentage' => 'required|numeric|min:0|max:100',
            'is_zone_based' => 'boolean',
            'valid_days' => 'required|integer|min:1',
        ]);

        $validated['slug'] = str($validated['name'])->slug();

        $rateCard->update($validated);

        return redirect()->route('rate-cards.index')->with('success', 'Rate card updated successfully');
    }

    public function destroy(RateCard $rateCard)
    {
        $rateCard->delete();

        return redirect()->route('rate-cards.index')->with('success', 'Rate card deleted successfully');
    }
}
