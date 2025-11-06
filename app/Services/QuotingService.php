<?php

namespace App\Services;

use App\Models\ExchangeRate;
use App\Models\Quote;
use App\Models\RateCard;
use App\Models\User;
use Carbon\Carbon;

class QuotingService
{
    /**
     * Generate a quote based on shipment details
     */
    public function generateQuote(
        string $originCountry,
        string $destinationCountry,
        string $serviceType,
        float $weight,
        string $weightUnit = 'kg',
        ?string $currency = null,
        ?Carbon $quoteDate = null,
        ?User $createdBy = null,
        ?string $notes = null
    ): Quote {
        $quoteDate = $quoteDate ?? now();
        $createdBy = $createdBy ?? auth()->user() ?? User::first();
        $currency = $currency ?? 'INR';

        // Find matching rate card
        $rateCard = $this->findRateCard(
            $originCountry,
            $destinationCountry,
            $serviceType
        );

        if (! $rateCard) {
            throw new \Exception('No active rate card found for the specified route');
        }

        // Calculate base cost
        $baseCost = $weight * (float) $rateCard->base_rate;
        $baseCost = max($baseCost, (float) $rateCard->minimum_charge);

        // Calculate surcharge
        $surcharge = $baseCost * ((float) $rateCard->surcharge_percentage / 100);

        // Get charges and calculate total
        $charges = $rateCard->charges()->where('status', 'active')->get();
        $chargesTotal = $this->calculateCharges($charges, $weight, $baseCost);

        // Calculate total before currency conversion
        $totalCost = $baseCost + $surcharge + $chargesTotal;

        // Get currency rate
        $currencyRate = $this->getCurrencyRate('INR', $currency, $quoteDate);
        $totalInCurrency = $totalCost * $currencyRate;

        // Create quote
        $quote = Quote::create([
            'rate_card_id' => $rateCard->id,
            'origin_country' => $originCountry,
            'destination_country' => $destinationCountry,
            'service_type' => $serviceType,
            'weight' => $weight,
            'weight_unit' => $weightUnit,
            'base_cost' => $baseCost,
            'charges_total' => $chargesTotal,
            'surcharge' => $surcharge,
            'total_cost' => $totalCost,
            'currency_rate' => $currencyRate,
            'currency' => $currency,
            'total_in_currency' => $totalInCurrency,
            'status' => 'draft',
            'valid_until' => $quoteDate->copy()->addDays($rateCard->valid_days),
            'notes' => $notes,
            'created_by' => $createdBy->id,
        ]);

        // Generate reference number
        $quote->update(['reference_number' => $quote->generateReferenceNumber()]);

        // Create quote items
        foreach ($charges as $charge) {
            $quote->items()->create([
                'pricing_charge_id' => $charge->id,
                'name' => $charge->name,
                'charge_type' => $charge->charge_type,
                'amount' => $charge->amount,
                'is_optional' => $charge->is_optional,
                'apply_order' => $charge->apply_order,
                'status' => $charge->status,
            ]);
        }

        return $quote->fresh()->load('items', 'rateCard');
    }

    /**
     * Find the best matching rate card
     */
    protected function findRateCard(string $origin, string $destination, string $serviceType): ?RateCard
    {
        return RateCard::where('status', 'active')
            ->where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->where('service_type', $serviceType)
            ->first();
    }

    /**
     * Calculate total charges
     */
    protected function calculateCharges($charges, float $weight, float $baseCost): float
    {
        $total = 0;

        foreach ($charges as $charge) {
            if ($charge->status !== 'active' && ! $charge->is_optional) {
                continue;
            }

            $amount = match ($charge->charge_type) {
                'fixed' => (float) $charge->amount,
                'percentage' => $baseCost * ((float) $charge->amount / 100),
                'weight_based' => $weight * ((float) $charge->amount),
                default => 0,
            };

            $total += $amount;
        }

        return $total;
    }

    /**
     * Get currency conversion rate
     */
    protected function getCurrencyRate(string $fromCurrency, string $toCurrency, Carbon $date): float
    {
        if ($fromCurrency === $toCurrency) {
            return 1.0;
        }

        $rate = ExchangeRate::where('from_currency', $fromCurrency)
            ->where('to_currency', $toCurrency)
            ->where('status', 'active')
            ->where('effective_date', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', $date);
            })
            ->latest('effective_date')
            ->first();

        return $rate ? (float) $rate->rate : 1.0;
    }
}
