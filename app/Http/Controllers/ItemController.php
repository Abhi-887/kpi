<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Item::with('unitOfMeasure');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('item_code', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('active')) {
            $query->where('active_flag', $request->boolean('active'));
        }

        $items = $query->paginate(15);

        return Inertia::render('Items/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'category', 'active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Items/Create', [
            'unitOfMeasures' => UnitOfMeasure::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'required|string|unique:items',
            'sku' => 'required|string|unique:items',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'unit_of_measure_id' => 'required|exists:unit_of_measures,id',
            'default_cost' => 'required|numeric|min:0',
            'default_price' => 'required|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'hsn_sac' => 'nullable|string',
            'active_flag' => 'boolean',
        ]);

        Item::create($validated);

        return redirect()->route('items.index')->with('success', 'Item created successfully');
    }

    public function show(Item $item): Response
    {
        $item->load(['unitOfMeasure', 'costComponents', 'priceLists']);

        return Inertia::render('Items/Show', [
            'item' => $item,
        ]);
    }

    public function edit(Item $item): Response
    {
        return Inertia::render('Items/Edit', [
            'item' => $item,
            'unitOfMeasures' => UnitOfMeasure::all(),
        ]);
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'item_code' => "required|string|unique:items,item_code,{$item->id}",
            'sku' => "required|string|unique:items,sku,{$item->id}",
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'unit_of_measure_id' => 'required|exists:unit_of_measures,id',
            'default_cost' => 'required|numeric|min:0',
            'default_price' => 'required|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'hsn_sac' => 'nullable|string',
            'active_flag' => 'boolean',
        ]);

        $item->update($validated);

        return redirect()->route('items.index')->with('success', 'Item updated successfully');
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return redirect()->route('items.index')->with('success', 'Item deleted successfully');
    }
}
