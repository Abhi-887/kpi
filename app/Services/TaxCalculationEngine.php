<?php

namespace App\Services;

use App\Models\Charge;
use App\Models\TaxCode;
use Illuminate\Support\Facades\Cache;

/**
 * Tax Calculation Engine
 *
 * Handles GST (Goods and Services Tax) calculations for charges and line items.
 * This engine reads from Charge Master and Tax Master to compute accurate tax amounts.
 */
class TaxCalculationEngine
{
    /**
     * Calculate tax amount for a given sale price and charge.
     *
     * @param  float  $salePriceInr  The sale price in INR
     * @param  int  $chargeId  The ID of the charge
     * @return array{sale_price: float, tax_code: string, tax_rate: float, tax_amount: float, total_amount: float}
     *
     * @throws \Exception If charge or tax code not found
     */
    public function getTaxAmount(float $salePriceInr, int $chargeId): array
    {
        // Find the charge and its default tax
        $charge = $this->getCharge($chargeId);

        if (! $charge) {
            throw new \Exception("Charge with ID {$chargeId} not found");
        }

        if (! $charge->default_tax_id) {
            throw new \Exception("Charge {$charge->charge_code} does not have a default tax configured");
        }

        // Get the tax code
        $taxCode = $this->getTaxCode($charge->default_tax_id);

        if (! $taxCode) {
            throw new \Exception("Tax code with ID {$charge->default_tax_id} not found");
        }

        // Verify tax is active and applicable
        if (! $taxCode->is_active) {
            throw new \Exception("Tax code {$taxCode->tax_code} is not active");
        }

        $taxRate = (float) $taxCode->rate / 100;
        $taxAmount = round($salePriceInr * $taxRate, 2);
        $totalAmount = round($salePriceInr + $taxAmount, 2);

        return [
            'sale_price' => round($salePriceInr, 2),
            'tax_code' => $taxCode->tax_code,
            'tax_rate' => round($taxRate, 4),
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ];
    }

    /**
     * Calculate tax for multiple line items (batch operation).
     *
     * @param  array<array{sale_price: float, charge_id: int}>  $items  Array of items to calculate
     * @return array<array{sale_price: float, tax_code: string, tax_rate: float, tax_amount: float, total_amount: float}>
     */
    public function calculateBatchTax(array $items): array
    {
        return array_map(
            fn ($item) => $this->getTaxAmount((float) $item['sale_price'], (int) $item['charge_id']),
            $items
        );
    }

    /**
     * Get tax breakdown with summary.
     *
     * @param  array<array{sale_price: float, charge_id: int}>  $items
     * @return array{items: array, totals: array{total_sale_price: float, total_tax_amount: float, total_amount: float}}
     */
    public function getTaxBreakdown(array $items): array
    {
        $calculatedItems = $this->calculateBatchTax($items);

        $totalSalePrice = array_reduce($calculatedItems, fn ($sum, $item) => $sum + $item['sale_price'], 0);
        $totalTaxAmount = array_reduce($calculatedItems, fn ($sum, $item) => $sum + $item['tax_amount'], 0);
        $totalAmount = array_reduce($calculatedItems, fn ($sum, $item) => $sum + $item['total_amount'], 0);

        return [
            'items' => $calculatedItems,
            'totals' => [
                'total_sale_price' => round($totalSalePrice, 2),
                'total_tax_amount' => round($totalTaxAmount, 2),
                'total_amount' => round($totalAmount, 2),
            ],
        ];
    }

    /**
     * Get charge with caching for performance.
     */
    private function getCharge(int $chargeId): ?Charge
    {
        return Cache::remember(
            "charge:{$chargeId}",
            3600,
            fn () => Charge::with('defaultTax')->find($chargeId)
        );
    }

    /**
     * Get tax code with caching for performance.
     */
    private function getTaxCode(int $taxCodeId): ?TaxCode
    {
        return Cache::remember(
            "tax_code:{$taxCodeId}",
            3600,
            fn () => TaxCode::find($taxCodeId)
        );
    }

    /**
     * Clear all caches (use when updating tax codes or charges).
     */
    public function clearCache(): void
    {
        Cache::tags('tax_calculation')->flush();
    }

    /**
     * Get all active tax codes for UI dropdowns.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveTaxCodes()
    {
        return TaxCode::where('is_active', true)
            ->orderBy('tax_code')
            ->get();
    }

    /**
     * Get all active charges for UI dropdowns.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveCharges()
    {
        return Charge::where('is_active', true)
            ->with('defaultTax')
            ->orderBy('charge_code')
            ->get();
    }
}
