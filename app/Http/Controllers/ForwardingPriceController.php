<?php

namespace App\Http\Controllers;

use App\Models\ForwardingPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForwardingPriceController extends Controller
{
    public function index()
    {
        $forwardingPrices = ForwardingPrice::when(request('search'), function ($query) {
            return $query->where('name', 'like', '%'.request('search').'%')
                ->orWhere('origin_country', 'like', '%'.request('search').'%')
                ->orWhere('destination_country', 'like', '%'.request('search').'%');
        })
            ->when(request('status'), function ($query) {
                return $query->where('is_active', request('status') === 'active');
            })
            ->when(request('service_type'), function ($query) {
                return $query->where('service_type', request('service_type'));
            })
            ->paginate(request('per_page', 50));

        return Inertia::render('ForwardingPrices/Index', [
            'forwardingPrices' => $forwardingPrices,
            'filters' => request()->only(['search', 'status', 'service_type', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('ForwardingPrices/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:forwarding_prices|max:255',
            'description' => 'nullable|string',
            'origin_country' => 'required|string|max:100',
            'destination_country' => 'required|string|max:100',
            'service_type' => 'required|in:standard,express,overnight,economy',
            'base_price' => 'required|numeric|min:0',
            'per_kg_price' => 'required|numeric|min:0',
            'per_cbm_price' => 'required|numeric|min:0',
            'handling_fee' => 'required|numeric|min:0',
            'transit_days' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        ForwardingPrice::create($validated);

        return redirect()->route('forwarding-prices.index')->with('success', 'Forwarding price created successfully');
    }

    public function edit(ForwardingPrice $forwardingPrice)
    {
        return Inertia::render('ForwardingPrices/Edit', [
            'forwardingPrice' => $forwardingPrice,
        ]);
    }

    public function update(Request $request, ForwardingPrice $forwardingPrice)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:forwarding_prices,name,'.$forwardingPrice->id.'|max:255',
            'description' => 'nullable|string',
            'origin_country' => 'required|string|max:100',
            'destination_country' => 'required|string|max:100',
            'service_type' => 'required|in:standard,express,overnight,economy',
            'base_price' => 'required|numeric|min:0',
            'per_kg_price' => 'required|numeric|min:0',
            'per_cbm_price' => 'required|numeric|min:0',
            'handling_fee' => 'required|numeric|min:0',
            'transit_days' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $forwardingPrice->update($validated);

        return redirect()->route('forwarding-prices.index')->with('success', 'Forwarding price updated successfully');
    }

    public function destroy(ForwardingPrice $forwardingPrice)
    {
        $forwardingPrice->delete();

        return redirect()->route('forwarding-prices.index')->with('success', 'Forwarding price deleted successfully');
    }
}
