<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuotationHeaderRequest;
use App\Http\Requests\UpdateQuotationHeaderRequest;
use App\Models\Customer;
use App\Models\Location;
use App\Models\QuotationHeader;
use App\Models\User;
use App\Services\CostingService;
use App\Services\QuotationBuilderService;
use App\Services\QuotationCreationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function __construct(
        protected QuotationCreationService $quotationService,
        protected QuotationBuilderService $builderService,
        protected CostingService $costingService
    ) {}

    /**
     * Display a listing of quotations
     */
    public function index(Request $request)
    {
        $query = QuotationHeader::with([
            'customer',
            'createdBy',
            'salesperson',
            'originPort',
            'destinationPort',
        ])->latest();

        // Search filtering
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('quote_id', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($sq) => $sq->where('company_name', 'like', "%{$search}%"));
            });
        }

        // Status filtering
        if ($request->filled('quote_status')) {
            $query->where('quote_status', $request->input('quote_status'));
        }

        // Mode filtering
        if ($request->filled('mode')) {
            $query->where('mode', $request->input('mode'));
        }

        // Movement filtering
        if ($request->filled('movement')) {
            $query->where('movement', $request->input('movement'));
        }

        $quotations = $query->paginate($request->input('per_page', 20));

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'filters' => $request->only(['search', 'quote_status', 'mode', 'movement', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new quotation
     */
    public function create()
    {
        return Inertia::render('Quotations/Create', [
            'customers' => Customer::select('id', 'company_name', 'email', 'phone')->get(),
            'ports' => Location::select('id', 'code', 'name', 'city', 'country')->where('is_active', true)->get(),
            'locations' => Location::select('id', 'code', 'name', 'city', 'country')->where('is_active', true)->get(),
            'salespersons' => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created quotation
     */
    public function store(StoreQuotationHeaderRequest $request)
    {
        try {
            $validated = $request->validated();

            // Fetch related models
            $customer = Customer::findOrFail($validated['customer_id']);
            $originPort = Location::findOrFail($validated['origin_port_id']);
            $destinationPort = Location::findOrFail($validated['destination_port_id']);
            $originLocation = $validated['origin_location_id'] ? Location::findOrFail($validated['origin_location_id']) : null;
            $destinationLocation = $validated['destination_location_id'] ? Location::findOrFail($validated['destination_location_id']) : null;
            $salesperson = $validated['salesperson_user_id'] ? User::findOrFail($validated['salesperson_user_id']) : null;

            // Create quotation
            $quotation = $this->quotationService->createQuotation(
                createdBy: auth()->user(),
                customer: $customer,
                mode: $validated['mode'],
                movement: $validated['movement'],
                terms: $validated['terms'],
                originPort: $originPort,
                destinationPort: $destinationPort,
                originLocation: $originLocation,
                destinationLocation: $destinationLocation,
                dimensions: $validated['dimensions'],
                salesperson: $salesperson,
                notes: $validated['notes'] ?? null
            );

            return redirect()->route('quotations.show', $quotation)->with('success', 'Quotation created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified quotation
     */
    public function show(QuotationHeader $quotation)
    {
        $quotation->load([
            'customer',
            'createdBy',
            'salesperson',
            'originPort',
            'destinationPort',
            'originLocation',
            'destinationLocation',
            'dimensions',
            'costLines.charge',
            'costLines.selectedVendor',
        ]);

        $data = $this->quotationService->getQuotationData($quotation);

        return Inertia::render('Quotations/Show', [
            'quotation' => $data,
            'costLines' => $quotation->costLines()->with('charge', 'selectedVendor')->get(),
        ]);
    }

    /**
     * Show the form for editing the quotation
     */
    public function edit(QuotationHeader $quotation)
    {
        // Only allow editing of Draft quotations
        if ($quotation->quote_status !== 'Draft') {
            return back()->withErrors(['error' => 'Only Draft quotations can be edited']);
        }

        $quotation->load('dimensions', 'customer', 'originPort', 'destinationPort');

        return Inertia::render('Quotations/Edit', [
            'quotation' => $quotation,
            'customers' => Customer::select('id', 'company_name', 'email', 'phone')->get(),
            'ports' => Location::select('id', 'code', 'name', 'city', 'country')->where('is_active', true)->get(),
            'locations' => Location::select('id', 'code', 'name', 'city', 'country')->where('is_active', true)->get(),
            'salespersons' => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified quotation
     */
    public function update(UpdateQuotationHeaderRequest $request, QuotationHeader $quotation)
    {
        try {
            $validated = $request->validated();

            $quotation->update($validated);

            return redirect()->route('quotations.show', $quotation)->with('success', 'Quotation updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete the specified quotation
     */
    public function destroy(QuotationHeader $quotation)
    {
        try {
            if ($quotation->quote_status !== 'Draft') {
                return back()->withErrors(['error' => 'Only Draft quotations can be deleted']);
            }

            $quotation->delete();

            return redirect()->route('quotations.index')->with('success', 'Quotation deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Prepare quotation for costing (transition from Draft to Pending Costing)
     */
    public function prepareForCosting(QuotationHeader $quotation)
    {
        if ($quotation->quote_status !== 'Draft') {
            return response()->json(['error' => 'Only Draft quotations can be prepared for costing'], 422);
        }

        // Update status to Pending Costing
        $quotation->update(['quote_status' => 'Pending Costing']);

        return response()->json([
            'success' => true,
            'quotation' => $this->quotationService->getQuotationData($quotation),
            'redirect' => route('quotations.costing', $quotation),
        ]);
    }

    /**
     * Duplicate a quotation with all its dimensions
     */
    public function duplicate(QuotationHeader $quotation)
    {
        try {
            $newQuotation = $this->builderService->duplicateQuotation($quotation);

            return response()->json([
                'success' => true,
                'message' => 'Quotation duplicated successfully',
                'quotation' => $newQuotation,
                'redirect' => route('quotations.show', $newQuotation),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
