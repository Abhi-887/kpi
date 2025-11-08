<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinalizeCostsRequest;
use App\Http\Requests\StoreQuotationHeaderRequest;
use App\Models\Customer;
use App\Models\Location;
use App\Models\QuotationHeader;
use App\Models\User;
use App\Services\DimensionCalculationService;
use App\Services\QuotationCostingService;
use App\Services\QuotationPricingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function __construct(
        protected DimensionCalculationService $dimensionService,
        protected QuotationCostingService $costingService,
        protected QuotationPricingService $pricingService
    ) {}

    /**
     * Display quotation management dashboard (Module 22)
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

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('quote_id', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($sq) => $sq->where('company_name', 'like', "%{$search}%"));
            });
        }

        // Filter by status
        if ($request->filled('quote_status')) {
            $query->where('quote_status', $request->input('quote_status'));
        }

        // Filter by customer
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $quotations = $query->paginate(20);

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'filters' => $request->only(['search', 'quote_status', 'customer_id', 'date_from', 'date_to']),
            'statuses' => [
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'pending_costing', 'label' => 'Pending Costing'],
                ['value' => 'pending_approval', 'label' => 'Pending Approval'],
                ['value' => 'sent', 'label' => 'Sent'],
                ['value' => 'won', 'label' => 'Won'],
                ['value' => 'lost', 'label' => 'Lost'],
            ],
        ]);
    }

    /**
     * Show quotation creation form (Module 19)
     */
    public function create()
    {
        $customers = Customer::query()
            ->select('id', 'company_name', 'primary_contact_name', 'email', 'phone')
            ->orderBy('company_name')
            ->limit(100)
            ->get();

        $ports = Location::query()
            ->select('id', 'name', 'code', 'country')
            ->orderBy('name')
            ->get();

        $locations = Location::query()
            ->select('id', 'name', 'code', 'country', 'city')
            ->orderBy('name')
            ->get();

        $salespersons = User::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Quotations/Create', [
            'customers' => $customers,
            'ports' => $ports,
            'locations' => $locations,
            'salespersons' => $salespersons,
            'modes' => ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL'],
            'movements' => ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL'],
            'incoterms' => ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'],
        ]);
    }

    /**
     * Store new quotation (Module 19)
     */
    public function store(StoreQuotationHeaderRequest $request)
    {
        $data = $request->validated();
        $dimensions = $data['dimensions'];
        unset($data['dimensions']);

        // Generate unique quote ID
        $quoteId = 'Q-'.date('Ymd').'-'.str_pad(
            QuotationHeader::whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );

        // Create quotation header
        $quotation = QuotationHeader::create([
            ...$data,
            'quote_id' => $quoteId,
            'created_by_user_id' => auth('web')->id(),
            'quote_status' => 'draft',
        ]);

        // Add dimensions
        foreach ($dimensions as $dim) {
            $quotation->dimensions()->create($dim);
        }

        // Calculate totals
        $this->dimensionService->calculateTotals($quotation);

        return response()->json([
            'success' => true,
            'message' => 'Quotation created successfully',
            'quotation_id' => $quotation->id,
            'quote_id' => $quoteId,
            'redirect' => route('quotations.show', $quotation),
        ]);
    }

    /**
     * Show quotation details
     */
    public function show(QuotationHeader $quotation)
    {
        $quotation->load([
            'customer',
            'createdBy',
            'salesperson',
            'originPort',
            'destinationPort',
            'dimensions',
            'costLines.charge',
            'saleLines.charge',
            'approval',
        ]);

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation,
        ]);
    }

    /**
     * Prepare quotation for costing (Module 20 initiation)
     */
    public function prepareForCosting(QuotationHeader $quotation)
    {
        if ($quotation->quote_status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft quotations can be prepared for costing',
            ], 422);
        }

        try {
            $costLines = $this->costingService->initiateCostingProcess($quotation);

            return response()->json([
                'success' => true,
                'message' => 'Costing process initiated',
                'cost_lines_count' => count($costLines),
                'redirect' => route('quotations.costing', $quotation),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Show costing module (Module 20)
     */
    public function costing(QuotationHeader $quotation)
    {
        if (! in_array($quotation->quote_status, ['draft', 'pending_costing'])) {
            return redirect()->route('quotations.show', $quotation)
                ->with('error', 'This quotation is not in a costing stage');
        }

        $quotation->load(['costLines.charge', 'costLines.selectedVendor']);

        $summary = $this->costingService->getCostLineSummary($quotation);

        return Inertia::render('Quotations/Costing', [
            'quotation' => $quotation,
            'cost_lines' => $summary,
            'total_cost_inr' => $quotation->total_cost_inr,
        ]);
    }

    /**
     * Update vendor selection for a cost line (Module 20 action)
     */
    public function updateCostLineVendor(Request $request, \App\Models\QuotationCostLine $costLine)
    {
        $validated = $request->validate([
            'selected_vendor_id' => 'required|integer',
            'unit_cost_rate' => 'required|numeric|min:0',
        ]);

        try {
            $updated = $this->costingService->updateCostLineVendor(
                $costLine,
                $validated['selected_vendor_id']
            );

            return response()->json([
                'success' => true,
                'cost_line' => $updated,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Finalize costs and move to pricing (Module 20 finalization)
     */
    public function finalizeCosts(QuotationHeader $quotation, FinalizeCostsRequest $request)
    {
        try {
            $updated = $this->costingService->finalizeCosts($quotation);

            return response()->json([
                'success' => true,
                'message' => 'Costs finalized successfully',
                'new_status' => $updated->quote_status,
                'redirect' => $updated->quote_status === 'pending_approval'
                    ? route('quotations.approval.show', $quotation)
                    : route('quotations.pricing', $quotation),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Show pricing/builder module (Module 21)
     */
    public function pricing(QuotationHeader $quotation)
    {
        if (! in_array($quotation->quote_status, ['pending_costing', 'pending_approval', 'sent'])) {
            return redirect()->route('quotations.show', $quotation)
                ->with('error', 'This quotation is not ready for pricing');
        }

        // Build pricing if not already done
        if ($quotation->saleLines()->count() === 0) {
            try {
                $this->pricingService->buildPricingFromCosts($quotation);
            } catch (\Exception $e) {
                return redirect()->route('quotations.show', $quotation)
                    ->with('error', $e->getMessage());
            }
        }

        $quotation->load(['saleLines.charge', 'costLines']);
        $summary = $this->pricingService->getPricingSummary($quotation);

        return Inertia::render('Quotations/Pricing', [
            'quotation' => $quotation,
            'pricing_summary' => $summary,
        ]);
    }

    /**
     * Update sale price override (Module 21 action)
     */
    public function updateSalePrice(Request $request, \App\Models\QuotationSaleLine $saleLine)
    {
        $validated = $request->validate([
            'sale_price_inr' => 'required|numeric|min:0',
        ]);

        try {
            $updated = $this->pricingService->updateSalePriceWithOverride(
                $saleLine,
                $validated['sale_price_inr']
            );

            $quotation = $saleLine->quotationHeader;
            $summary = $this->pricingService->getPricingSummary($quotation);

            return response()->json([
                'success' => true,
                'sale_line' => $updated,
                'updated_summary' => $summary,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Finalize pricing (Module 21 finalization)
     */
    public function finalizePricing(QuotationHeader $quotation)
    {
        try {
            $updated = $this->pricingService->finalizePricing($quotation);

            return response()->json([
                'success' => true,
                'message' => 'Pricing finalized and quotation sent',
                'redirect' => route('quotations.show', $quotation),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Duplicate quotation (Module 22 action)
     */
    public function duplicate(QuotationHeader $quotation)
    {
        $newQuote = $quotation->replicate(['quote_id', 'quote_status', 'created_at', 'updated_at']);
        $newQuote->quote_id = 'Q-'.date('Ymd').'-'.str_pad(
            QuotationHeader::whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );
        $newQuote->quote_status = 'draft';
        $newQuote->save();

        // Duplicate dimensions
        foreach ($quotation->dimensions as $dim) {
            $newQuote->dimensions()->create($dim->replicate(['quotation_header_id'])->toArray());
        }

        return response()->json([
            'success' => true,
            'message' => 'Quotation duplicated successfully',
            'new_quote_id' => $newQuote->id,
            'redirect' => route('quotations.show', $newQuote),
        ]);
    }

    /**
     * Update quotation status (Module 22 actions: Won/Lost)
     */
    public function updateStatus(Request $request, QuotationHeader $quotation)
    {
        $validated = $request->validate([
            'status' => 'required|in:won,lost',
        ]);

        $quotation->update(['quote_status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Quotation status updated',
        ]);
    }
}
