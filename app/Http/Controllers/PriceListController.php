<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\PriceList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PriceListController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PriceList::with('item');

        if ($request->filled('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $priceLists = $query->paginate(15);

        return Inertia::render('PriceLists/Index', [
            'priceLists' => $priceLists,
            'filters' => $request->only(['item_id', 'active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('PriceLists/Create', [
            'items' => Item::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'base_price' => 'required|numeric|min:0',
            'min_qty' => 'required|integer|min:0',
            'max_qty' => 'nullable|integer|min:0',
            'customer_group' => 'nullable|string',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'contract_reference' => 'nullable|string',
            'currency' => 'required|string|max:3',
            'is_active' => 'boolean',
        ]);

        PriceList::create($validated);

        return redirect()->route('price-lists.index')->with('success', 'Price List created successfully');
    }

    public function edit(PriceList $priceList): Response
    {
        return Inertia::render('PriceLists/Edit', [
            'priceList' => $priceList,
            'items' => Item::all(),
        ]);
    }

    public function update(Request $request, PriceList $priceList)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'base_price' => 'required|numeric|min:0',
            'min_qty' => 'required|integer|min:0',
            'max_qty' => 'nullable|integer|min:0',
            'customer_group' => 'nullable|string',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'contract_reference' => 'nullable|string',
            'currency' => 'required|string|max:3',
            'is_active' => 'boolean',
        ]);

        $priceList->update($validated);

        return redirect()->route('price-lists.index')->with('success', 'Price List updated successfully');
    }

    public function destroy(PriceList $priceList)
    {
        $priceList->delete();

        return redirect()->route('price-lists.index')->with('success', 'Price List deleted successfully');
    }
}
