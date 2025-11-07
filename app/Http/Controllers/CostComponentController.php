<?php

namespace App\Http\Controllers;

use App\Models\CostComponent;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CostComponentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CostComponent::with('item');

        if ($request->filled('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        if ($request->filled('component_type')) {
            $query->where('component_type', $request->component_type);
        }

        $costComponents = $query->paginate(15);

        return Inertia::render('CostComponents/Index', [
            'costComponents' => $costComponents,
            'filters' => $request->only(['item_id', 'component_type']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('CostComponents/Create', [
            'items' => Item::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'component_type' => 'required|in:Material,Labour,Overhead,Packaging,Logistics',
            'unit_cost' => 'required|numeric|min:0',
            'quantity_factor' => 'required|numeric|min:0.0001',
            'currency' => 'required|string|max:3',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        CostComponent::create($validated);

        return redirect()->route('cost-components.index')->with('success', 'Cost Component created successfully');
    }

    public function edit(CostComponent $costComponent): Response
    {
        return Inertia::render('CostComponents/Edit', [
            'costComponent' => $costComponent,
            'items' => Item::all(),
        ]);
    }

    public function update(Request $request, CostComponent $costComponent)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'component_type' => 'required|in:Material,Labour,Overhead,Packaging,Logistics',
            'unit_cost' => 'required|numeric|min:0',
            'quantity_factor' => 'required|numeric|min:0.0001',
            'currency' => 'required|string|max:3',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        $costComponent->update($validated);

        return redirect()->route('cost-components.index')->with('success', 'Cost Component updated successfully');
    }

    public function destroy(CostComponent $costComponent)
    {
        $costComponent->delete();

        return redirect()->route('cost-components.index')->with('success', 'Cost Component deleted successfully');
    }
}
