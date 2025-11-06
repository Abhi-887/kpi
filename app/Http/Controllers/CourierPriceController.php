<?php

namespace App\Http\Controllers;

use App\Models\CourierPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourierPriceController extends Controller
{
    public function index()
    {
        $courierPrices = CourierPrice::when(request('search'), function ($query) {
            return $query->where('name', 'like', '%'.request('search').'%')
                ->orWhere('carrier_name', 'like', '%'.request('search').'%')
                ->orWhere('coverage_area', 'like', '%'.request('search').'%');
        })
            ->when(request('status'), function ($query) {
                return $query->where('is_active', request('status') === 'active');
            })
            ->when(request('service_type'), function ($query) {
                return $query->where('service_type', request('service_type'));
            })
            ->paginate(request('per_page', 50));

        return Inertia::render('CourierPrices/Index', [
            'courierPrices' => $courierPrices,
            'filters' => request()->only(['search', 'status', 'service_type', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('CourierPrices/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:courier_prices|max:255',
            'description' => 'nullable|string',
            'carrier_name' => 'required|string|max:100',
            'service_type' => 'required|in:standard,express,overnight,economy',
            'base_price' => 'required|numeric|min:0',
            'per_kg_price' => 'required|numeric|min:0',
            'surcharge' => 'required|numeric|min:0',
            'transit_days' => 'required|integer|min:1',
            'coverage_area' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        CourierPrice::create($validated);

        return redirect()->route('courier-prices.index')->with('success', 'Courier price created successfully');
    }

    public function edit(CourierPrice $courierPrice)
    {
        return Inertia::render('CourierPrices/Edit', [
            'courierPrice' => $courierPrice,
        ]);
    }

    public function update(Request $request, CourierPrice $courierPrice)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:courier_prices,name,'.$courierPrice->id.'|max:255',
            'description' => 'nullable|string',
            'carrier_name' => 'required|string|max:100',
            'service_type' => 'required|in:standard,express,overnight,economy',
            'base_price' => 'required|numeric|min:0',
            'per_kg_price' => 'required|numeric|min:0',
            'surcharge' => 'required|numeric|min:0',
            'transit_days' => 'required|integer|min:1',
            'coverage_area' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        $courierPrice->update($validated);

        return redirect()->route('courier-prices.index')->with('success', 'Courier price updated successfully');
    }

    public function destroy(CourierPrice $courierPrice)
    {
        $courierPrice->delete();

        return redirect()->route('courier-prices.index')->with('success', 'Courier price deleted successfully');
    }
}
