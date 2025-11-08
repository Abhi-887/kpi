<?php

namespace App\Http\Controllers;

use App\Models\TaxCode;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaxCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TaxCode::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('tax_code', 'like', "%{$search}%")
                ->orWhere('tax_name', 'like', "%{$search}%");
        }

        if ($request->filled('tax_type')) {
            $query->where('tax_type', $request->tax_type);
        }

        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $taxCodes = $query->paginate(15);

        return Inertia::render('TaxCodes/Index', [
            'taxCodes' => $taxCodes,
            'filters' => $request->only(['search', 'tax_type', 'active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('TaxCodes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tax_code' => 'required|string|unique:tax_codes',
            'tax_name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'applicability' => 'required|in:Sale,Purchase,Both',
            'tax_type' => 'required|in:IGST,CGST,SGST,VAT,Other',
            'jurisdiction' => 'nullable|string',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean',
        ]);

        $tax = TaxCode::create($validated);

        if ($request->expectsJson()) {
            return response()->json(['tax' => $tax], 201);
        }

        return redirect()->route('tax-codes.index')->with('success', 'Tax Code created successfully');
    }

    public function edit(TaxCode $taxCode): Response
    {
        return Inertia::render('TaxCodes/Edit', [
            'taxCode' => $taxCode,
        ]);
    }

    public function update(Request $request, TaxCode $taxCode)
    {
        $validated = $request->validate([
            'tax_code' => "required|string|unique:tax_codes,tax_code,{$taxCode->id}",
            'tax_name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'applicability' => 'required|in:Sale,Purchase,Both',
            'tax_type' => 'required|in:IGST,CGST,SGST,VAT,Other',
            'jurisdiction' => 'nullable|string',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean',
        ]);

        $taxCode->update($validated);

        if ($request->expectsJson()) {
            return response()->json(['tax' => $taxCode], 200);
        }

        return redirect()->route('tax-codes.index')->with('success', 'Tax Code updated successfully');
    }

    public function destroy(TaxCode $taxCode)
    {
        $taxCode->delete();

        if (request()->expectsJson()) {
            return response()->json([], 204);
        }

        return redirect()->route('tax-codes.index')->with('success', 'Tax Code deleted successfully');
    }
}
