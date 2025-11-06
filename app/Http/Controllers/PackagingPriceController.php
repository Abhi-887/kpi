<?php

namespace App\Http\Controllers;

use App\Models\PackagingPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackagingPriceController extends Controller
{
    public function index()
    {
        $packagingPrices = PackagingPrice::when(request('search'), function ($query) {
            return $query->where('name', 'like', '%'.request('search').'%')
                ->orWhere('package_type', 'like', '%'.request('search').'%')
                ->orWhere('material', 'like', '%'.request('search').'%');
        })
            ->when(request('status'), function ($query) {
                return $query->where('is_active', request('status') === 'active');
            })
            ->when(request('package_type'), function ($query) {
                return $query->where('package_type', request('package_type'));
            })
            ->paginate(request('per_page', 50));

        return Inertia::render('PackagingPrices/Index', [
            'packagingPrices' => $packagingPrices,
            'filters' => request()->only(['search', 'status', 'package_type', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('PackagingPrices/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:packaging_prices|max:255',
            'description' => 'nullable|string',
            'package_type' => 'required|in:box,envelope,tube,crate,pallet',
            'size_category' => 'required|in:small,medium,large,xlarge',
            'length' => 'required|numeric|min:0',
            'width' => 'required|numeric|min:0',
            'height' => 'required|numeric|min:0',
            'max_weight' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'bulk_price_5' => 'nullable|numeric|min:0',
            'bulk_price_10' => 'nullable|numeric|min:0',
            'material' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        PackagingPrice::create($validated);

        return redirect()->route('packaging-prices.index')->with('success', 'Packaging price created successfully');
    }

    public function edit(PackagingPrice $packagingPrice)
    {
        return Inertia::render('PackagingPrices/Edit', [
            'packagingPrice' => $packagingPrice,
        ]);
    }

    public function update(Request $request, PackagingPrice $packagingPrice)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:packaging_prices,name,'.$packagingPrice->id.'|max:255',
            'description' => 'nullable|string',
            'package_type' => 'required|in:box,envelope,tube,crate,pallet',
            'size_category' => 'required|in:small,medium,large,xlarge',
            'length' => 'required|numeric|min:0',
            'width' => 'required|numeric|min:0',
            'height' => 'required|numeric|min:0',
            'max_weight' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'bulk_price_5' => 'nullable|numeric|min:0',
            'bulk_price_10' => 'nullable|numeric|min:0',
            'material' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        $packagingPrice->update($validated);

        return redirect()->route('packaging-prices.index')->with('success', 'Packaging price updated successfully');
    }

    public function destroy(PackagingPrice $packagingPrice)
    {
        $packagingPrice->delete();

        return redirect()->route('packaging-prices.index')->with('success', 'Packaging price deleted successfully');
    }
}
