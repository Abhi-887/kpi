<?php

namespace App\Services;

use App\Models\QuotationHeader;
use Illuminate\Support\Collection;

class QuotationBuilderService
{
    public function __construct(
        protected MarginEngine $marginEngine,
        protected TaxCalculationEngine $taxEngine
    ) {}

    /**
     * Build sale lines from cost lines with margin and tax calculations
     * Called when user moves to the builder stage
     */
    public function buildSaleLinesFromCosts(QuotationHeader $quotation): Collection
    {
        $costLines = $quotation->costLines()->with('charge')->get();

        if ($costLines->isEmpty()) {
            throw new \Exception('No cost lines found for this quotation');
        }

        $saleLines = collect();

        foreach ($costLines as $costLine) {
            // Skip if sale line already exists for this charge
            if ($quotation->saleLines()->where('charge_id', $costLine->charge_id)->exists()) {
                continue;
            }

            // Get suggested sale price from Margin Engine
            $marginResult = $this->marginEngine->calculateSalePrice(
                costInr: (float) $costLine->cost_rate_inr,
                chargeId: $costLine->charge_id,
                customerId: $quotation->customer_id
            );

            // Get applicable tax from Tax Engine
            $taxResult = $this->taxEngine->getTaxAmount(
                salePriceInr: (float) $marginResult['sale_price'],
                chargeId: $costLine->charge_id
            );

            // Create sale line
            $saleLine = $quotation->saleLines()->create([
                'charge_id' => $costLine->charge_id,
                'display_name' => $costLine->display_name,
                'quantity' => 1,
                'unit_sale_rate' => $marginResult['sale_price'],
                'sale_currency' => 'INR',
                'cost_rate_inr' => $costLine->cost_rate_inr,
                'margin_percentage' => $marginResult['margin_applied'] ?? 0,
                'total_sale_price_inr' => $marginResult['sale_price'],
                'tax_rate' => $taxResult['tax_rate'],
                'tax_amount_inr' => $taxResult['tax_amount'],
                'line_total_with_tax_inr' => $taxResult['total_amount'],
            ]);

            $saleLines->push($saleLine);
        }

        return $saleLines;
    }

    /**
     * Calculate sale price based on cost and margin
     */
    public function calculateSalePrice(float $baseCost, float $marginPercentage): float
    {
        $markup = ($baseCost * $marginPercentage) / 100;

        return round($baseCost + $markup, 2);
    }

    /**
     * Calculate tax amount
     */
    public function calculateTax(float $baseAmount, float $taxRate): float
    {
        return round(($baseAmount * $taxRate) / 100, 2);
    }

    /**
     * Update salesperson's margin override for a line
     */
    public function updateSalePriceOverride(QuotationHeader $quotation, int $saleLineId, float $newSalePrice): void
    {
        $saleLine = $quotation->saleLines()->findOrFail($saleLineId);

        // Recalculate margin percentage based on new sale price
        $newMarginPercentage = $saleLine->cost_rate_inr > 0
            ? (($newSalePrice - $saleLine->cost_rate_inr) / $saleLine->cost_rate_inr) * 100
            : 0;

        // Recalculate tax
        $taxResult = $this->taxEngine->getTaxAmount($newSalePrice, $saleLine->charge_id);

        $saleLine->update([
            'unit_sale_rate' => $newSalePrice,
            'total_sale_price_inr' => $newSalePrice,
            'margin_percentage' => round($newMarginPercentage, 2),
            'tax_rate' => $taxResult['tax_rate'],
            'tax_amount_inr' => $taxResult['tax_amount'],
            'line_total_with_tax_inr' => $taxResult['total_amount'],
        ]);
    }

    /**
     * Get builder grid data for UI rendering
     */
    public function getBuilderGridData(QuotationHeader $quotation): array
    {
        $saleLines = $quotation->saleLines()->with('charge')->get();

        $totalInternalCost = $saleLines->sum('cost_rate_inr');
        $totalSalePrice = $saleLines->sum('total_sale_price_inr');
        $totalTax = $saleLines->sum('tax_amount_inr');
        $totalWithTax = $saleLines->sum('line_total_with_tax_inr');

        $overallMargin = $totalInternalCost > 0
            ? round((($totalSalePrice - $totalInternalCost) / $totalInternalCost) * 100, 2)
            : 0;

        return [
            'quotation_id' => $quotation->id,
            'quote_id' => $quotation->quote_id,
            'customer' => $quotation->customer->company_name,
            'salesperson' => $quotation->salesperson?->name ?? 'N/A',
            'sale_lines' => $saleLines->map(fn ($line) => [
                'id' => $line->sale_line_id,
                'charge_id' => $line->charge_id,
                'display_name' => $line->display_name,
                'quantity' => (int) $line->quantity,
                'cost_rate_inr' => (float) $line->cost_rate_inr,
                'unit_sale_rate' => (float) $line->unit_sale_rate,
                'margin_percentage' => (float) $line->margin_percentage,
                'total_sale_price_inr' => (float) $line->total_sale_price_inr,
                'tax_rate' => (float) $line->tax_rate,
                'tax_amount_inr' => (float) $line->tax_amount_inr,
                'line_total_with_tax_inr' => (float) $line->line_total_with_tax_inr,
            ])->toArray(),
            'totals' => [
                'total_internal_cost' => (float) $totalInternalCost,
                'total_sale_price' => (float) $totalSalePrice,
                'total_tax' => (float) $totalTax,
                'total_with_tax' => (float) $totalWithTax,
                'overall_margin_percentage' => (float) $overallMargin,
            ],
        ];
    }

    /**
     * Finalize sale lines and move quotation to "Sent" status
     */
    public function finalizeSaleLines(QuotationHeader $quotation): QuotationHeader
    {
        // Verify all sale lines are complete
        $incompleteLines = $quotation->saleLines()
            ->whereNull('total_sale_price_inr')
            ->count();

        if ($incompleteLines > 0) {
            throw new \Exception('All sale lines must have pricing before finalizing');
        }

        // Update quotation status to "Sent"
        $quotation->update(['quote_status' => 'Sent']);

        return $quotation->fresh();
    }

    /**
     * Duplicate a quotation with all its dimensions
     */
    public function duplicateQuotation(QuotationHeader $sourceQuotation): QuotationHeader
    {
        // Create new header with same data but reset status to Draft
        $newQuotation = $sourceQuotation->replicate();
        $newQuotation->quote_status = 'Draft';
        $newQuotation->quote_id = null; // Will be auto-generated
        $newQuotation->save();

        // Duplicate all dimensions
        $sourceQuotation->dimensions->each(function ($dimension) use ($newQuotation) {
            $newDimension = $dimension->replicate();
            $newDimension->quotation_header_id = $newQuotation->id;
            $newDimension->save();
        });

        return $newQuotation->fresh();
    }
}
