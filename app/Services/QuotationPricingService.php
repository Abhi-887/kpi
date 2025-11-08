<?php

namespace App\Services;

use App\Models\QuotationHeader;
use App\Models\QuotationSaleLine;
use Exception;

class QuotationPricingService
{
    public function __construct(
        protected MarginEngine $marginEngine,
        protected TaxCalculationEngine $taxEngine
    ) {}

    /**
     * Build quotation pricing from cost lines
     * This populates Quotation_Sale_Lines with internal costs and suggested margins
     */
    public function buildPricingFromCosts(QuotationHeader $quotation): array
    {
        // Clear existing sale lines
        $quotation->saleLines()->delete();

        $costLines = $quotation->costLines()->with('charge')->get();

        if ($costLines->isEmpty()) {
            throw new Exception('No cost lines found. Complete costing first.');
        }

        $saleLines = [];

        foreach ($costLines as $costLine) {
            // Get margin suggestion from Margin Engine
            $marginCalc = $this->marginEngine->calculateSalePrice(
                costInr: $costLine->total_cost_inr,
                chargeId: $costLine->charge_id
            );

            $suggestedSalePrice = $marginCalc['sale_price'];
            $suggestedMarginPercentage = $marginCalc['margin_applied'] * 100; // Convert to percentage

            // Calculate tax
            $taxData = $this->taxEngine->getTaxAmount(
                salePriceInr: $suggestedSalePrice,
                chargeId: $costLine->charge_id
            );

            $saleLine = $quotation->saleLines()->create([
                'charge_id' => $costLine->charge_id,
                'display_name' => $costLine->charge->charge_name ?? 'Charge',
                'quantity' => 1,
                'unit_sale_rate' => $suggestedSalePrice,
                'sale_currency' => 'INR',
                'total_sale_price_inr' => $suggestedSalePrice,
                'tax_rate' => $taxData['tax_rate'] * 100, // Convert to percentage
                'tax_amount_inr' => $taxData['tax_amount'],
                'line_total_with_tax_inr' => $taxData['total_amount'],
                'internal_cost_inr' => $costLine->total_cost_inr,
                'margin_percentage' => $suggestedMarginPercentage,
            ]);

            $saleLines[] = $saleLine;
        }

        return $saleLines;
    }

    /**
     * Update sale price for a line (salesperson override)
     * Recalculates margin % and tax automatically
     */
    public function updateSalePriceWithOverride(QuotationSaleLine $saleLine, float $newPrice): QuotationSaleLine
    {
        // Calculate new margin
        $internalCost = (float) $saleLine->internal_cost_inr;
        if ($internalCost > 0) {
            $newMargin = (($newPrice - $internalCost) / $internalCost) * 100;
        } else {
            $newMargin = 0;
        }

        // Recalculate tax
        $taxData = $this->taxEngine->getTaxAmount(
            salePriceInr: $newPrice,
            chargeId: $saleLine->charge_id
        );

        $saleLine->update([
            'unit_sale_rate' => $newPrice,
            'total_sale_price_inr' => $newPrice,
            'tax_rate' => $taxData['tax_rate'] * 100,
            'tax_amount_inr' => $taxData['tax_amount'],
            'line_total_with_tax_inr' => $taxData['total_amount'],
            'margin_percentage' => $newMargin,
        ]);

        return $saleLine->fresh();
    }

    /**
     * Get pricing summary for a quotation
     */
    public function getPricingSummary(QuotationHeader $quotation): array
    {
        $saleLines = $quotation->saleLines()->with('charge')->get();

        $totalCostInr = 0;
        $totalSalePriceInr = 0;
        $totalTaxInr = 0;
        $totalWithTaxInr = 0;

        $lines = [];

        foreach ($saleLines as $line) {
            $totalCostInr += (float) $line->internal_cost_inr;
            $totalSalePriceInr += (float) $line->total_sale_price_inr;
            $totalTaxInr += (float) $line->tax_amount_inr;
            $totalWithTaxInr += (float) $line->line_total_with_tax_inr;

            $lines[] = [
                'id' => $line->id,
                'charge_id' => $line->charge_id,
                'charge_name' => $line->charge->charge_name ?? '',
                'display_name' => $line->display_name,
                'internal_cost_inr' => (float) $line->internal_cost_inr,
                'sale_price_inr' => (float) $line->total_sale_price_inr,
                'margin_percentage' => (float) $line->margin_percentage,
                'tax_rate' => (float) $line->tax_rate,
                'tax_amount_inr' => (float) $line->tax_amount_inr,
                'total_with_tax_inr' => (float) $line->line_total_with_tax_inr,
            ];
        }

        $overallMargin = $totalCostInr > 0
            ? (($totalSalePriceInr - $totalCostInr) / $totalCostInr) * 100
            : 0;

        return [
            'lines' => $lines,
            'total_cost_inr' => (float) $totalCostInr,
            'total_sale_price_inr' => (float) $totalSalePriceInr,
            'total_margin_inr' => (float) ($totalSalePriceInr - $totalCostInr),
            'overall_margin_percentage' => (float) $overallMargin,
            'total_tax_inr' => (float) $totalTaxInr,
            'total_with_tax_inr' => (float) $totalWithTaxInr,
        ];
    }

    /**
     * Finalize pricing and generate quotation for sending
     */
    public function finalizePricing(QuotationHeader $quotation): QuotationHeader
    {
        // Validate all sale lines exist
        if ($quotation->saleLines()->count() === 0) {
            throw new Exception('No sale lines found. Build pricing first.');
        }

        // Update quotation status
        $quotation->update(['quote_status' => 'sent']);

        // Update approval with final pricing if exists
        if ($quotation->approval) {
            $summary = $this->getPricingSummary($quotation);
            $quotation->approval()->update([
                'total_sale_price_inr' => $summary['total_sale_price_inr'],
                'total_margin_percentage' => $summary['overall_margin_percentage'],
            ]);
        }

        return $quotation->fresh();
    }
}
