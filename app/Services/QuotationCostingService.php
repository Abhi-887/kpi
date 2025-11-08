<?php

namespace App\Services;

use App\Models\Charge;
use App\Models\QuotationCostLine;
use App\Models\QuotationHeader;
use Exception;

class QuotationCostingService
{
    public function __construct(
        protected ChargeEngine $chargeEngine,
        protected RateEngine $rateEngine,
        protected ExchangeRateEngine $exchangeRateEngine
    ) {}

    /**
     * Initiate costing process for a quotation
     * This is the "Orchestra" that coordinates all engines
     *
     * Steps:
     * 1. Get applicable charges for the shipment combination
     * 2. For each charge, find all vendor rates
     * 3. Populate quotation_cost_lines with all options
     */
    public function initiateCostingProcess(QuotationHeader $quotation): array
    {
        // Get applicable charges
        $applicableCharges = $this->chargeEngine->getApplicableCharges(
            $quotation->mode,
            $quotation->movement,
            $quotation->terms
        );

        if ($applicableCharges->isEmpty()) {
            throw new Exception('No applicable charges found for this shipment combination');
        }

        $costLines = [];

        foreach ($applicableCharges as $charge) {
            // Check if cost line already exists
            $existingCostLine = $quotation->costLines()
                ->where('charge_id', $charge->id)
                ->first();

            if ($existingCostLine) {
                $costLines[] = $existingCostLine;
                continue;
            }

            // Find matching vendor rates for this charge
            $shipmentDetails = [
                'origin_port_id' => $quotation->origin_port_id,
                'destination_port_id' => $quotation->destination_port_id,
                'mode' => $quotation->mode,
                'movement' => $quotation->movement,
                'terms' => $quotation->terms,
                'chargeable_weight' => $quotation->total_chargeable_weight,
            ];

            $vendorCosts = $this->rateEngine->findMatchingCosts($shipmentDetails);

            // Filter for this specific charge
            $vendorRates = collect();
            foreach ($vendorCosts as $vendor) {
                foreach ($vendor['charges'] as $chargeData) {
                    if ($chargeData['charge_id'] == $charge->id) {
                        $vendorRates->push([
                            'supplier_id' => $vendor['vendor_id'],
                            'supplier_name' => $vendor['vendor_name'],
                            'rate' => $chargeData['cost_rate'],
                            'currency' => $chargeData['currency'],
                        ]);
                    }
                }
            }

            if ($vendorRates->isEmpty()) {
                // Create cost line without vendor rates (manual entry needed)
                $costLine = $quotation->costLines()->create([
                    'charge_id' => $charge->id,
                    'all_vendor_costs' => [],
                    'selected_vendor_id' => null,
                    'unit_cost_rate' => 0,
                    'unit_cost_currency' => 'INR',
                    'cost_exchange_rate' => 1.0,
                    'total_cost_inr' => 0,
                ]);
            } else {
                // Build vendor costs array
                $allVendorCosts = [];
                $selectedVendor = null;
                $lowestCost = PHP_INT_MAX;
                $currency = 'INR';

                foreach ($vendorRates as $rate) {
                    $cost = (float) $rate['rate'];
                    $allVendorCosts[$rate['supplier_id']] = $cost;
                    $currency = $rate['currency'] ?? 'INR';

                    // Find the cheapest (Rank 1)
                    if ($cost < $lowestCost) {
                        $lowestCost = $cost;
                        $selectedVendor = $rate['supplier_id'];
                    }
                }

                // Get exchange rate if currency is not INR
                $exchangeRate = 1.0;
                if ($currency !== 'INR') {
                    $rate = $this->exchangeRateEngine->getRate($currency, 'INR', today());
                    $exchangeRate = $rate ?? 1.0;
                }

                // Create cost line with Rank 1 pre-selected
                $costLine = $quotation->costLines()->create([
                    'charge_id' => $charge->id,
                    'all_vendor_costs' => $allVendorCosts,
                    'selected_vendor_id' => $selectedVendor,
                    'unit_cost_rate' => $lowestCost,
                    'unit_cost_currency' => $currency,
                    'cost_exchange_rate' => $exchangeRate,
                    'total_cost_inr' => $lowestCost * $exchangeRate,
                ]);
            }

            $costLines[] = $costLine;
        }

        // Update quotation status
        $quotation->update(['quote_status' => 'pending_costing']);

        return $costLines;
    }

    /**
     * Update vendor selection for a cost line
     * Recalculates the total_cost_inr
     */
    public function updateCostLineVendor(QuotationCostLine $costLine, int $vendorId): QuotationCostLine
    {
        if (! isset($costLine->all_vendor_costs[$vendorId])) {
            throw new Exception("Vendor {$vendorId} not available for this charge");
        }

        $cost = $costLine->all_vendor_costs[$vendorId];

        $costLine->update([
            'selected_vendor_id' => $vendorId,
            'unit_cost_rate' => $cost,
            'total_cost_inr' => $cost * $costLine->cost_exchange_rate,
        ]);

        return $costLine->fresh();
    }

    /**
     * Finalize costs - lock in selections and update quotation status
     * This moves quotation to next stage (Approval or BuildPrice depending on rules)
     */
    public function finalizeCosts(QuotationHeader $quotation): QuotationHeader
    {
        // Validate all cost lines have selections
        $costLinesWithoutSelection = $quotation->costLines()
            ->whereNull('selected_vendor_id')
            ->where('unit_cost_rate', 0)
            ->count();

        if ($costLinesWithoutSelection > 0) {
            throw new Exception("All charges must have a vendor selected before finalizing");
        }

        // Check if approval is required
        $requiresApproval = $quotation->isApprovalRequired();

        if ($requiresApproval) {
            $quotation->update(['quote_status' => 'pending_approval']);

            // Create approval request
            $quotation->approval()->create([
                'submitted_by_user_id' => auth('web')->id(),
                'approval_status' => 'pending',
                'total_cost_inr' => $quotation->total_cost_inr,
                'total_sale_price_inr' => 0, // Will be populated during pricing
                'submitted_at' => now(),
            ]);
        } else {
            $quotation->update(['quote_status' => 'sent']);
        }

        return $quotation->fresh();
    }

    /**
     * Get cost line summary for display
     */
    public function getCostLineSummary(QuotationHeader $quotation): array
    {
        $costLines = $quotation->costLines()->with('charge', 'selectedVendor')->get();

        return $costLines->map(fn ($line) => [
            'id' => $line->id,
            'charge_id' => $line->charge_id,
            'charge_name' => $line->charge->charge_name ?? '',
            'charge_code' => $line->charge->charge_code ?? '',
            'selected_vendor_id' => $line->selected_vendor_id,
            'selected_vendor_name' => $line->selectedVendor?->name ?? 'Not Selected',
            'unit_cost_rate' => $line->unit_cost_rate,
            'currency' => $line->unit_cost_currency,
            'exchange_rate' => $line->cost_exchange_rate,
            'total_cost_inr' => $line->total_cost_inr,
            'all_vendor_costs' => $line->all_vendor_costs ?? [],
            'is_rank_1' => $line->isCurrentSelectionCheapest(),
        ])->toArray();
    }
}
