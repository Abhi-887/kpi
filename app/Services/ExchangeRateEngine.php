<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Exchange Rate Engine
 *
 * Central service for managing and retrieving exchange rates with historical accuracy.
 * Ensures consistent currency conversion across quotes, invoices, and shipments.
 *
 * Key Features:
 * - Historical rate retrieval (looks up rate for any specific date)
 * - Caching for performance optimization
 * - Bulk operations for daily rate updates
 * - Conversion with multi-currency support
 */
class ExchangeRateEngine
{
    private const CACHE_DURATION = 3600; // 1 hour

    /**
     * Get the most recent applicable exchange rate for a currency pair on a given date
     *
     * Implements the core logic: find the most recent rate <= target date
     *
     * @param string $fromCurrency Source currency code (e.g., 'USD', 'EUR')
     * @param string $toCurrency Target currency code (e.g., 'INR')
     * @param Carbon|string|null $effectiveDate Date to look up rate for (defaults to today)
     *
     * @return float|null Exchange rate or null if no rate found
     */
    public function getRate(string $fromCurrency, string $toCurrency, $effectiveDate = null): ?float
    {
        $effectiveDate = $this->parseDate($effectiveDate);
        $cacheKey = "exchange_rate:{$fromCurrency}:{$toCurrency}:{$effectiveDate->format('Y-m-d')}";

        // Check if it's the same currency (rate = 1.0)
        if (strtoupper($fromCurrency) === strtoupper($toCurrency)) {
            return 1.0;
        }

        $rate = ExchangeRate::query()
            ->where('from_currency', strtoupper($fromCurrency))
            ->where('to_currency', strtoupper($toCurrency))
            ->where('effective_date', '<=', $effectiveDate)
            ->where('status', 'active')
            ->orderBy('effective_date', 'desc')
            ->first();

        return $rate ? (float) $rate->rate : null;
    }

    /**
     * Convert an amount from one currency to another on a specific date
     *
     * @param float $amount Amount to convert
     * @param string $fromCurrency Source currency code
     * @param string $toCurrency Target currency code
     * @param Carbon|string|null $effectiveDate Date for rate lookup
     *
     * @return float|null Converted amount or null if rate not found
     */
    public function convert(float $amount, string $fromCurrency, string $toCurrency, $effectiveDate = null): ?float
    {
        $rate = $this->getRate($fromCurrency, $toCurrency, $effectiveDate);

        return $rate ? $amount * $rate : null;
    }

    /**
     * Get the inverse rate (for reverse conversions)
     *
     * @param string $fromCurrency Source currency code
     * @param string $toCurrency Target currency code
     * @param Carbon|string|null $effectiveDate Date for rate lookup
     *
     * @return float|null Inverse rate or null if rate not found
     */
    public function getInverseRate(string $fromCurrency, string $toCurrency, $effectiveDate = null): ?float
    {
        $effectiveDate = $this->parseDate($effectiveDate);

        $rate = ExchangeRate::query()
            ->where('from_currency', strtoupper($fromCurrency))
            ->where('to_currency', strtoupper($toCurrency))
            ->where('effective_date', '<=', $effectiveDate)
            ->where('status', 'active')
            ->orderBy('effective_date', 'desc')
            ->first();

        return $rate ? (1 / (float) $rate->rate) : null;
    }

    /**
     * Get all active rates for a specific currency on a date
     *
     * @param string $baseCurrency Currency to get all rates for
     * @param Carbon|string|null $effectiveDate Date for rate lookup
     *
     * @return Collection Collection of rates with target currencies
     */
    public function getRatesForCurrency(string $baseCurrency, $effectiveDate = null): Collection
    {
        $effectiveDate = $this->parseDate($effectiveDate);
        $baseCurrency = strtoupper($baseCurrency);

        $subquery = ExchangeRate::query()
            ->select('from_currency', 'to_currency')
            ->selectRaw('MAX(effective_date) as latest_date')
            ->where('from_currency', $baseCurrency)
            ->where('effective_date', '<=', $effectiveDate)
            ->where('status', 'active')
            ->groupBy('from_currency', 'to_currency');

        $rates = ExchangeRate::query()
            ->joinSub($subquery, 'latest', function ($join) {
                $join->on('exchange_rates.from_currency', '=', 'latest.from_currency')
                    ->on('exchange_rates.to_currency', '=', 'latest.to_currency')
                    ->on('exchange_rates.effective_date', '=', 'latest.latest_date');
            })
            ->get(['exchange_rates.from_currency', 'exchange_rates.to_currency', 'exchange_rates.rate', 'exchange_rates.effective_date']);

        return $rates->mapWithKeys(fn ($rate) => [
            $rate->to_currency => [
                'rate' => (float) $rate->rate,
                'effective_date' => $rate->effective_date,
            ],
        ]);
    }

    /**
     * Bulk update rates for multiple currencies on a specific date
     *
     * Used for the daily update admin screen. Creates new rate records for today.
     *
     * @param array $rates Array of rates: ['USD' => 83.28, 'EUR' => 90.45, ...]
     * @param string $baseCurrency Base currency (defaults to 'INR')
     * @param Carbon|string|null $effectiveDate Date rates are effective from
     * @param string $source Source of rates (e.g., 'manual', 'api', 'rbi')
     *
     * @return Collection Created rate records
     */
    public function bulkUpdateRates(array $rates, string $baseCurrency = 'INR', $effectiveDate = null, string $source = 'manual'): Collection
    {
        $effectiveDate = $this->parseDate($effectiveDate);
        $baseCurrency = strtoupper($baseCurrency);
        $createdRates = collect();

        foreach ($rates as $currency => $rate) {
            $currency = strtoupper($currency);

            // Skip if same currency
            if ($currency === $baseCurrency) {
                continue;
            }

            // Deactivate old rates for this pair
            ExchangeRate::where('from_currency', $currency)
                ->where('to_currency', $baseCurrency)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);

            // Create new rate
            $record = ExchangeRate::create([
                'from_currency' => $currency,
                'to_currency' => $baseCurrency,
                'rate' => $rate,
                'inverse_rate' => 1 / $rate,
                'effective_date' => $effectiveDate,
                'source' => $source,
                'status' => 'active',
            ]);

            $createdRates->push($record);
        }

        return $createdRates;
    }

    /**
     * Get rate history for a currency pair
     *
     * Useful for auditing and tracking rate changes over time
     *
     * @param string $fromCurrency Source currency code
     * @param string $toCurrency Target currency code
     * @param int $limit Number of records to return
     *
     * @return Collection Historical rates ordered by date descending
     */
    public function getHistory(string $fromCurrency, string $toCurrency, int $limit = 30): Collection
    {
        return ExchangeRate::query()
            ->where('from_currency', strtoupper($fromCurrency))
            ->where('to_currency', strtoupper($toCurrency))
            ->orderBy('effective_date', 'desc')
            ->limit($limit)
            ->get(['id', 'rate', 'inverse_rate', 'effective_date', 'source', 'status']);
    }

    /**
     * Get rate on a specific date (exact match)
     *
     * @param string $fromCurrency Source currency code
     * @param string $toCurrency Target currency code
     * @param Carbon|string $effectiveDate Exact date to match
     *
     * @return ExchangeRate|null Rate record or null if not found
     */
    public function getRateRecord(string $fromCurrency, string $toCurrency, $effectiveDate): ?ExchangeRate
    {
        $effectiveDate = $this->parseDate($effectiveDate);

        return ExchangeRate::query()
            ->where('from_currency', strtoupper($fromCurrency))
            ->where('to_currency', strtoupper($toCurrency))
            ->where('effective_date', $effectiveDate)
            ->where('status', 'active')
            ->first();
    }

    /**
     * Check if a rate exists for a date range
     *
     * @param string $fromCurrency Source currency code
     * @param string $toCurrency Target currency code
     * @param Carbon|string $startDate Start of date range
     * @param Carbon|string|null $endDate End of date range (defaults to start date)
     *
     * @return bool True if rate exists
     */
    public function hasRate(string $fromCurrency, string $toCurrency, $startDate, $endDate = null): bool
    {
        $startDate = $this->parseDate($startDate);
        $endDate = $endDate ? $this->parseDate($endDate) : $startDate;

        return ExchangeRate::query()
            ->where('from_currency', strtoupper($fromCurrency))
            ->where('to_currency', strtoupper($toCurrency))
            ->whereBetween('effective_date', [$startDate, $endDate])
            ->where('status', 'active')
            ->exists();
    }

    /**
     * Get all active currency pairs in the system
     *
     * @return Collection Unique pairs: [['from' => 'USD', 'to' => 'INR'], ...]
     */
    public function getActivePairs(): Collection
    {
        return ExchangeRate::query()
            ->where('status', 'active')
            ->where('effective_date', '<=', today())
            ->distinct()
            ->get(['from_currency', 'to_currency'])
            ->groupBy('from_currency')
            ->map(fn ($group) => $group->pluck('to_currency')->unique())
            ->toBase();
    }

    /**
     * Validate rate data before bulk update
     *
     * @param array $rates Rate data to validate
     * @param string $baseCurrency Base currency
     *
     * @return array Validation result: ['valid' => bool, 'errors' => []]
     */
    public function validateRates(array $rates, string $baseCurrency = 'INR'): array
    {
        $errors = [];
        $baseCurrency = strtoupper($baseCurrency);

        foreach ($rates as $currency => $rate) {
            $currency = strtoupper($currency);

            // Check if rate is a valid number
            if (!is_numeric($rate) || $rate <= 0) {
                $errors[] = "{$currency}: Rate must be a positive number (got: {$rate})";
            }

            // Check for excessive precision (more than 6 decimals)
            if (is_numeric($rate) && strlen(strrchr($rate, '.') ?? '') > 7) {
                $errors[] = "{$currency}: Rate exceeds maximum precision (max 6 decimals)";
            }

            // Check if same as base currency
            if ($currency === $baseCurrency) {
                $errors[] = "{$currency}: Cannot set rate for base currency";
            }

            // Check if currency code is 3 characters
            if (strlen($currency) !== 3) {
                $errors[] = "{$currency}: Currency code must be 3 characters";
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Parse date input to Carbon instance
     *
     * @param mixed $date Date input (Carbon, string, or null)
     *
     * @return Carbon Parsed date
     */
    private function parseDate($date = null): Carbon
    {
        if ($date === null) {
            return today();
        }

        if ($date instanceof Carbon) {
            return $date->startOfDay();
        }

        return Carbon::parse($date)->startOfDay();
    }
}
