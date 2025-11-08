<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChargeRequest;
use App\Http\Requests\UpdateChargeRequest;
use App\Models\Charge;
use App\Models\TaxCode;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChargeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Charge::query()->with(['defaultUom', 'defaultTax']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('charge_code', 'like', "%{$search}%")
                ->orWhere('charge_name', 'like', "%{$search}%")
                ->orWhere('charge_id', 'like', "%{$search}%");
        }

        if ($request->filled('charge_type')) {
            $query->where('charge_type', $request->charge_type);
        }

        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $charges = $query->paginate(15);

        return Inertia::render('Charges/Index', [
            'charges' => $charges,
            'filters' => $request->only(['search', 'charge_type', 'active']),
            'unitOfMeasures' => UnitOfMeasure::all(['id', 'name', 'symbol']),
            'taxCodes' => TaxCode::where('is_active', true)->get(['id', 'tax_code', 'tax_name']),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Charges/Create', [
            'unitOfMeasures' => UnitOfMeasure::all(['id', 'name', 'symbol']),
            'taxCodes' => TaxCode::where('is_active', true)->get(['id', 'tax_code', 'tax_name']),
        ]);
    }

    public function store(StoreChargeRequest $request)
    {
        Charge::create($request->validated());

        if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            return response()->json(['success' => true], 201);
        }

        return redirect()->route('charges.index')->with('success', 'Charge created successfully');
    }

    public function edit(Charge $charge): Response
    {
        return Inertia::render('Charges/Edit', [
            'charge' => $charge->load(['defaultUom', 'defaultTax']),
            'unitOfMeasures' => UnitOfMeasure::all(['id', 'name', 'symbol']),
            'taxCodes' => TaxCode::where('is_active', true)->get(['id', 'tax_code', 'tax_name']),
        ]);
    }

    public function update(UpdateChargeRequest $request, Charge $charge)
    {
        $charge->update($request->validated());

        if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            return response()->json(['success' => true], 200);
        }

        return redirect()->route('charges.index')->with('success', 'Charge updated successfully');
    }

    public function destroy(Request $request, Charge $charge)
    {
        if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            $charge->delete();

            return response()->json(['success' => true], 200);
        }

        $charge->delete();

        return redirect()->route('charges.index')->with('success', 'Charge deleted successfully');
    }
}
