<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVendorRateHeaderRequest;
use App\Http\Requests\UpdateVendorRateHeaderRequest;
use App\Models\Charge;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\UnitOfMeasure;
use App\Models\VendorRateHeader;
use App\Models\VendorRateLine;
use App\Services\RateEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorRateController extends Controller
{
    public function __construct(private RateEngine $rateEngine) {}

    /**
     * Display list of vendor rate headers
     */
    public function index(): Response
    {
        $rates = VendorRateHeader::query()
            ->with(['vendor', 'originPort', 'destinationPort', 'lines'])
            ->when(request('search'), function ($query) {
                $search = request('search');
                $query->whereHas('vendor', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->when(request('mode'), fn ($q) => $q->where('mode', request('mode')))
            ->when(request('movement'), fn ($q) => $q->where('movement', request('movement')))
            ->when(request('vendor_id'), fn ($q) => $q->where('vendor_id', request('vendor_id')))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn ($rate) => [
                'id' => $rate->id,
                'vendor_name' => $rate->vendor->name,
                'route' => $rate->originPort->code . ' → ' . $rate->destinationPort->code,
                'mode' => $rate->mode,
                'movement' => $rate->movement,
                'terms' => $rate->terms,
                'valid_from' => $rate->valid_from->format('Y-m-d'),
                'valid_upto' => $rate->valid_upto->format('Y-m-d'),
                'is_active' => $rate->is_active,
                'line_count' => $rate->lines->count(),
                'created_at' => $rate->created_at->format('M d, Y'),
            ]);

        return Inertia::render('VendorRates/Index', [
            'rates' => $rates,
            'filters' => [
                'search' => request('search'),
                'mode' => request('mode'),
                'movement' => request('movement'),
                'vendor_id' => request('vendor_id'),
            ],
            'modes' => ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL'],
            'movements' => ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL'],
            'vendors' => Supplier::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    /**
     * Show create form
     */
    public function create(): Response
    {
        return Inertia::render('VendorRates/Create', [
            'vendors' => Supplier::where('is_active', true)->get(['id', 'name', 'supplier_id']),
            'locations' => Location::where('is_active', true)->get(['id', 'code', 'name', 'city', 'country', 'type']),
            'charges' => Charge::where('is_active', true)->get(['id', 'charge_code', 'charge_name']),
            'uoms' => UnitOfMeasure::all(['id', 'name', 'symbol']),
            'modes' => ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL'],
            'movements' => ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL'],
            'terms' => ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'],
        ]);
    }

    /**
     * Store new rate header and lines
     */
    public function store(StoreVendorRateHeaderRequest $request)
    {
        $header = VendorRateHeader::create($request->validated());

        $lines = collect($request->validated('lines'))
            ->map(function ($line) use ($header) {
                return array_merge($line, [
                    'rate_header_id' => $header->id,
                ]);
            })
            ->all();

        VendorRateLine::insert($lines);

        // Validate the rate header
        $validation = $this->rateEngine->validateRateHeader($header->id);
        if (!$validation['is_valid']) {
            return back()->withErrors(['lines' => $validation['issues'][0]]);
        }

        return redirect()->route('vendor-rates.show', $header)
            ->with('success', 'Rate card created successfully');
    }

    /**
     * Show rate header details
     */
    public function show(VendorRateHeader $vendorRate): Response
    {
        $vendorRate->load(['vendor', 'originPort', 'destinationPort', 'lines.charge', 'lines.uom']);

        return Inertia::render('VendorRates/Show', [
            'rate' => [
                'id' => $vendorRate->id,
                'vendor_id' => $vendorRate->vendor_id,
                'vendor_name' => $vendorRate->vendor->name,
                'mode' => $vendorRate->mode,
                'movement' => $vendorRate->movement,
                'origin_port_id' => $vendorRate->origin_port_id,
                'origin_port' => $vendorRate->originPort->full_name,
                'destination_port_id' => $vendorRate->destination_port_id,
                'destination_port' => $vendorRate->destinationPort->full_name,
                'terms' => $vendorRate->terms,
                'valid_from' => $vendorRate->valid_from->format('Y-m-d'),
                'valid_upto' => $vendorRate->valid_upto->format('Y-m-d'),
                'is_active' => $vendorRate->is_active,
                'notes' => $vendorRate->notes,
                'created_at' => $vendorRate->created_at->format('M d, Y H:i'),
            ],
            'lines' => $vendorRate->lines->map(fn ($line) => [
                'id' => $line->id,
                'charge_id' => $line->charge_id,
                'charge_code' => $line->charge->charge_code,
                'charge_name' => $line->charge->charge_name,
                'uom_id' => $line->uom_id,
                'uom_symbol' => $line->uom->symbol,
                'currency_code' => $line->currency_code,
                'slab_min' => (float) $line->slab_min,
                'slab_max' => (float) $line->slab_max,
                'cost_rate' => (float) $line->cost_rate,
                'is_fixed_rate' => $line->is_fixed_rate,
                'sequence' => $line->sequence,
                'is_active' => $line->is_active,
                'notes' => $line->notes,
            ])->values(),
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(VendorRateHeader $vendorRate): Response
    {
        $vendorRate->load(['vendor', 'originPort', 'destinationPort', 'lines']);

        return Inertia::render('VendorRates/Edit', [
            'rate' => [
                'id' => $vendorRate->id,
                'vendor_id' => $vendorRate->vendor_id,
                'mode' => $vendorRate->mode,
                'movement' => $vendorRate->movement,
                'origin_port_id' => $vendorRate->origin_port_id,
                'destination_port_id' => $vendorRate->destination_port_id,
                'terms' => $vendorRate->terms,
                'valid_from' => $vendorRate->valid_from->format('Y-m-d'),
                'valid_upto' => $vendorRate->valid_upto->format('Y-m-d'),
                'is_active' => $vendorRate->is_active,
                'notes' => $vendorRate->notes,
                'lines' => $vendorRate->lines->map(fn ($line) => [
                    'id' => $line->id,
                    'charge_id' => $line->charge_id,
                    'uom_id' => $line->uom_id,
                    'currency_code' => $line->currency_code,
                    'slab_min' => (float) $line->slab_min,
                    'slab_max' => (float) $line->slab_max,
                    'cost_rate' => (float) $line->cost_rate,
                    'is_fixed_rate' => $line->is_fixed_rate,
                    'sequence' => $line->sequence,
                    'is_active' => $line->is_active,
                    'notes' => $line->notes,
                ])->values(),
            ],
            'vendors' => Supplier::where('is_active', true)->get(['id', 'name']),
            'locations' => Location::where('is_active', true)->get(['id', 'code', 'name', 'city']),
            'charges' => Charge::where('is_active', true)->get(['id', 'charge_code', 'charge_name']),
            'uoms' => UnitOfMeasure::all(['id', 'name', 'symbol']),
            'modes' => ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL'],
            'movements' => ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL'],
            'terms' => ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'],
        ]);
    }

    /**
     * Update rate header and lines
     */
    public function update(UpdateVendorRateHeaderRequest $request, VendorRateHeader $vendorRate)
    {
        $validated = $request->validated();

        $vendorRate->update($validated);

        if (isset($validated['lines'])) {
            // Delete lines that are not in the update
            $lineIds = collect($validated['lines'])
                ->pluck('id')
                ->filter()
                ->values();

            $vendorRate->lines()->whereNotIn('id', $lineIds)->delete();

            // Update or create lines
            foreach ($validated['lines'] as $line) {
                if (isset($line['id'])) {
                    VendorRateLine::find($line['id'])->update($line);
                } else {
                    $vendorRate->lines()->create($line);
                }
            }
        }

        // Validate the rate header
        $validation = $this->rateEngine->validateRateHeader($vendorRate->id);
        if (!$validation['is_valid']) {
            return back()->withErrors(['lines' => $validation['issues'][0]]);
        }

        return redirect()->route('vendor-rates.show', $vendorRate)
            ->with('success', 'Rate card updated successfully');
    }

    /**
     * Delete rate header (soft delete pattern)
     */
    public function destroy(VendorRateHeader $vendorRate)
    {
        $vendorRate->update(['is_active' => false]);
        $vendorRate->lines()->update(['is_active' => false]);

        return redirect()->route('vendor-rates.index')
            ->with('success', 'Rate card deactivated successfully');
    }

    /**
     * API: Find matching costs for a shipment
     */
    public function findMatchingCosts(Request $request)
    {
        $validated = $request->validate([
            'origin_port_id' => 'required|exists:locations,id',
            'destination_port_id' => 'required|exists:locations,id',
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'terms' => 'required|in:EXW,FCA,CPT,CIP,DAP,DDP,FOB,CFR,CIF',
            'chargeable_weight' => 'required|numeric|min:0',
            'date' => 'sometimes|date',
        ]);

        $costs = $this->rateEngine->findMatchingCosts($validated);

        return response()->json([
            'success' => true,
            'data' => $costs,
            'total_vendors' => $costs->count(),
        ]);
    }

    /**
     * API: Get rates for specific charge
     */
    public function ratesForCharge(Request $request)
    {
        $validated = $request->validate([
            'origin_port_id' => 'required|exists:locations,id',
            'destination_port_id' => 'required|exists:locations,id',
            'mode' => 'required',
            'movement' => 'required',
            'terms' => 'required',
            'charge_id' => 'required|exists:charges,id',
            'date' => 'sometimes|date',
        ]);

        $rates = $this->rateEngine->findRatesForCharge(
            $validated['origin_port_id'],
            $validated['destination_port_id'],
            $validated['mode'],
            $validated['movement'],
            $validated['terms'],
            $validated['charge_id'],
            $validated['date'] ?? null
        );

        return response()->json([
            'success' => true,
            'data' => $rates->map(fn ($rate) => [
                'id' => $rate->id,
                'vendor_name' => $rate->rateHeader->vendor->name,
                'currency' => $rate->currency_code,
                'slab_min' => (float) $rate->slab_min,
                'slab_max' => (float) $rate->slab_max,
                'cost_rate' => (float) $rate->cost_rate,
                'is_fixed_rate' => $rate->is_fixed_rate,
                'uom' => $rate->uom->symbol,
            ]),
        ]);
    }

    /**
     * API: Validate rate header for conflicts
     */
    public function validateRate(Request $request, VendorRateHeader $vendorRate)
    {
        $validation = $this->rateEngine->validateRateHeader($vendorRate->id);

        return response()->json($validation);
    }

    /**
     * API: Calculate total cost from vendor
     */
    public function calculateVendorCost(Request $request, VendorRateHeader $vendorRate)
    {
        $validated = $request->validate([
            'chargeable_weight' => 'required|numeric|min:0',
            'exclude_charges' => 'sometimes|array',
            'exclude_charges.*' => 'exists:charges,id',
        ]);

        $cost = $this->rateEngine->calculateVendorCost(
            $vendorRate->id,
            $validated['chargeable_weight'],
            $validated['exclude_charges'] ?? null
        );

        return response()->json([
            'success' => true,
            'cost' => $cost,
            'currency' => 'USD',
        ]);
    }
}

