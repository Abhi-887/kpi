<?php

namespace App\Http\Controllers;

use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitOfMeasureController extends Controller
{
    public function index(Request $request): Response
    {
        $query = UnitOfMeasure::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('symbol', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $units = $query->paginate(15);

        return Inertia::render('UnitOfMeasures/Index', [
            'units' => $units,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('UnitOfMeasures/Create', [
            'baseUnits' => UnitOfMeasure::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:unit_of_measures',
            'symbol' => 'required|string',
            'base_uom' => 'nullable|exists:unit_of_measures,id',
            'conversion_factor' => 'required|numeric|min:0.0001',
            'category' => 'required|in:Weight,Length,Volume,Count',
        ]);

        $unit = UnitOfMeasure::create($validated);

        if ($request->expectsJson()) {
            return response()->json(['unit' => $unit], 201);
        }

        return redirect()->route('uoms.index')->with('success', 'Unit of Measure created successfully');
    }

    public function edit(UnitOfMeasure $uom): Response
    {
        return Inertia::render('UnitOfMeasures/Edit', [
            'unit' => $uom,
            'baseUnits' => UnitOfMeasure::where('id', '!=', $uom->id)->get(),
        ]);
    }

    public function update(Request $request, UnitOfMeasure $uom)
    {
        $validated = $request->validate([
            'name' => "required|string|unique:unit_of_measures,name,{$uom->id}",
            'symbol' => 'required|string',
            'base_uom' => "nullable|exists:unit_of_measures,id",
            'conversion_factor' => 'required|numeric|min:0.0001',
            'category' => 'required|in:Weight,Length,Volume,Count',
        ]);

        $uom->update($validated);

        if ($request->expectsJson()) {
            return response()->json(['unit' => $uom], 200);
        }

        return redirect()->route('uoms.index')->with('success', 'Unit of Measure updated successfully');
    }

    public function destroy(UnitOfMeasure $uom)
    {
        $uom->delete();

        if (request()->expectsJson()) {
            return response()->json([], 204);
        }

        return redirect()->route('uoms.index')->with('success', 'Unit of Measure deleted successfully');
    }
}
