<?php

namespace App\Services;

use App\Models\Charge;
use App\Models\QuotationCostLine;
use App\Models\QuotationHeader;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CostingService
{
    public function __construct(
        protected ChargeEngine $chargeEngine,
        protected RateEngine $rateEngine,
        protected ExchangeRateEngine $exchangeRateEngine
    ) {}

    /**
     * ORCHESTRATE COSTING FOR A QUOTATION (Module 20 - The "Orchestra")
     * This is the main costing process that ties together all the engines
     *
     * Steps:
     * 1. Get applicable charges for this quotation (Charge Applicability Engine)
     * 2. For each charge, find all matching vendor rates (Rate Management Engine)
     * 3. Get current exchange rates (Exchange Rate Engine)
     * 4. Rank vendors by cost and create cost lines (logic here)
     * 5. Store all in quotation_cost_lines table
     */
    public function orchestrateCostingForQuotation(QuotationHeader $quotation): Collection
    {
        return DB::transaction(function () use ($quotation) {
            $quotation->load('originPort', 'destinationPort', 'dimensions');

            // Step 1: Get applicable charges for this quotation's mode/movement/terms
            $applicableCharges = $this->chargeEngine->getApplicableCharges(
                mode: $quotation->mode,
                movement: $quotation->movement,
                incoterm: $quotation->terms
            );

            if ($applicableCharges->isEmpty()) {
                throw new \Exception('No applicable charges found for this quotation');
            }

            $costLines = [];

            // Step 2-4: For each applicable charge, find vendors and rank them
            foreach ($applicableCharges as $charge) {
                $costLine = $this->createCostLineForCharge(
                    $quotation,
                    $charge
                );

                if ($costLine) {
                    $costLines[] = $costLine;
                }
            }

            return collect($costLines);
        });
    }

    /**
     * Create a cost line for a specific charge
     * Finds all vendor rates, ranks them, and stores the result
     */
    protected function createCostLineForCharge(QuotationHeader $quotation, Charge $charge): ?QuotationCostLine
    {
        // Check if cost line already exists
        $existingLine = $quotation->costLines()
            ->where('charge_id', $charge->id)
            ->first();

        if ($existingLine) {
            return $existingLine;
        }

        // Find all vendor rates for this charge
        $vendorRates = $this->rateEngine->findMatchingRatesForCharge(
            chargeId: $charge->id,
            originPortId: $quotation->origin_port_id,
            destinationPortId: $quotation->destination_port_id,
            totalChargeableWeight: (float) $quotation->total_chargeable_weight,
            totalCbm: (float) $quotation->total_cbm,
            mode: $quotation->mode,
            movement: $quotation->movement
        );

        if ($vendorRates->isEmpty()) {
            // No rates found for this charge - create a placeholder
            return null;
        }

        // Convert all vendor rates to INR for comparison
        $allVendorCostsJson = [];
        $minCost = PHP_FLOAT_MAX;
        $minCostVendorId = null;
        $minCostRate = null;
        $exchangeRate = 1.0;

        foreach ($vendorRates as $rate) {
            $vendor = $rate->supplier;
            $costInr = $this->convertToInr(
                amount: (float) $rate->rate,
                currency: $rate->currency,
                quotation: $quotation
            );

            $allVendorCostsJson[$vendor->id] = $costInr;

            // Track the cheapest (Rank 1)
            if ($costInr < $minCost) {
                $minCost = $costInr;
                $minCostVendorId = $vendor->id;
                $minCostRate = (float) $rate->rate;
                $exchangeRate = $this->exchangeRateEngine->getRate(
                    from: $rate->currency,
                    to: 'INR'
                );
            }
        }

        // Create the cost line with Rank 1 as default selection
        return $quotation->costLines()->create([
            'charge_id' => $charge->id,
            'all_vendor_costs_json' => $allVendorCostsJson,
            'selected_vendor_id' => $minCostVendorId,
            'unit_cost_rate' => $minCostRate,
            'unit_cost_currency' => 'INR', // Stored as INR for consistency
            'cost_exchange_rate' => $exchangeRate,
            'total_cost_inr' => $minCost,
        ]);
    }

    /**
     * Convert amount to INR using Exchange Rate Engine
     */
    protected function convertToInr(float $amount, string $currency, QuotationHeader $quotation): float
    {
        if ($currency === 'INR') {
            return $amount;
        }

        $rate = $this->exchangeRateEngine->getRate(
            from: $currency,
            to: 'INR'
        );

        return $amount * $rate;
    }

    /**
     * Get costing grid data formatted for frontend display (Module 20 UI)
     * Returns grid with all vendor options and highlighting
     */
    public function getCostingGridData(QuotationHeader $quotation): array
    {
        $costLines = $quotation->costLines()
            ->with('charge', 'selectedVendor')
            ->get();

        $gridRows = $costLines->map(function (QuotationCostLine $costLine) {
            $vendorOptions = $costLine->vendor_options ?? [];

            return [
                'id' => $costLine->id,
                'charge_id' => $costLine->charge_id,
                'charge_name' => $costLine->charge->charge_name,
                'charge_code' => $costLine->charge->charge_code,
                'selected_vendor_id' => $costLine->selected_vendor_id,
                'selected_vendor_name' => $costLine->selectedVendor?->name,
                'total_cost_inr' => (float) $costLine->total_cost_inr,
                'is_rank_1' => $costLine->isCurrentSelectionCheapest(),
                'vendor_options' => $vendorOptions,
                'notes' => $costLine->notes,
            ];
        })->toArray();

        return [
            'quote_id' => $quotation->quote_id,
            'customer_name' => $quotation->customer->company_name,
            'mode' => $quotation->mode,
            'movement' => $quotation->movement,
            'total_chargeable_weight' => (float) $quotation->total_chargeable_weight,
            'total_cbm' => (float) $quotation->total_cbm,
            'grid_rows' => $gridRows,
            'grand_total_inr' => collect($gridRows)->sum('total_cost_inr'),
            'rank_1_count' => collect($gridRows)->filter(fn ($row) => $row['is_rank_1'])->count(),
            'overridden_count' => collect($gridRows)->filter(fn ($row) => ! $row['is_rank_1'])->count(),
        ];
    }

    /**
     * Update vendor selection for a cost line
     * Allows ops team to override Rank 1 with their preferred vendor
     */
    public function updateVendorSelection(
        QuotationCostLine $costLine,
        Supplier $vendor,
        float $unitCostRate
    ): QuotationCostLine {
        // Get exchange rate if not INR
        $exchangeRate = 1.0;
        if ($costLine->unit_cost_currency !== 'INR') {
            $exchangeRate = $this->exchangeRateEngine->getRate(
                from: $costLine->unit_cost_currency,
                to: 'INR'
            );
        }

        $totalCostInr = $unitCostRate * $exchangeRate;

        $costLine->update([
            'selected_vendor_id' => $vendor->id,
            'unit_cost_rate' => $unitCostRate,
            'cost_exchange_rate' => $exchangeRate,
            'total_cost_inr' => $totalCostInr,
        ]);

        return $costLine->refresh();
    }

    /**
     * Finalize all costs for a quotation
     * Locks in all selections and transitions quotation to next stage
     */
    public function finalizeQuotationCosts(QuotationHeader $quotation): QuotationHeader
    {
        // Verify all cost lines have a selected vendor
        $costLines = $quotation->costLines()->whereNull('selected_vendor_id')->get();

        if ($costLines->isNotEmpty()) {
            throw new \Exception('All charges must have a selected vendor before finalizing');
        }

        // Update quotation status to Pending Approval
        $quotation->update(['quote_status' => 'Pending Approval']);

        return $quotation;
    }

    /**
     * Get costing summary for quotation (for dashboard display)
     */
    public function getCostingSummary(QuotationHeader $quotation): array
    {
        $costLines = $quotation->costLines()->with('charge', 'selectedVendor')->get();

        return [
            'quote_id' => $quotation->quote_id,
            'total_chargeable_weight' => (float) $quotation->total_chargeable_weight,
            'total_cbm' => (float) $quotation->total_cbm,
            'charges_count' => $costLines->count(),
            'grand_total_inr' => (float) $costLines->sum('total_cost_inr'),
            'cheapest_rank_selections' => $costLines->filter(fn ($line) => $line->isCurrentSelectionCheapest())->count(),
            'overridden_selections' => $costLines->filter(fn ($line) => ! $line->isCurrentSelectionCheapest())->count(),
        ];
    }
}
