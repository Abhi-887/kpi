<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateExchangeRatesRequest;
use App\Models\ExchangeRate;
use App\Services\ExchangeRateEngine;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExchangeRateController extends Controller
{
    public function __construct(
        protected ExchangeRateEngine $engine
    ) {}

    /**
     * Display exchange rates dashboard
     */
    public function index()
    {
        $activePairs = ExchangeRate::query()
            ->where('status', 'active')
            ->where('effective_date', '<=', today())
            ->distinct()
            ->get(['from_currency', 'to_currency'])
            ->groupBy('from_currency')
            ->map(fn ($group) => [
                'currencies' => $group->pluck('to_currency')->values()->toArray(),
                'count' => $group->count(),
            ]);

        $recentRates = ExchangeRate::query()
            ->where('status', 'active')
            ->orderBy('effective_date', 'desc')
            ->limit(20)
            ->get(['id', 'from_currency', 'to_currency', 'rate', 'effective_date', 'source']);

        return Inertia::render('ExchangeRates/Index', [
            'activePairs' => $activePairs->toArray(),
            'recentRates' => $recentRates,
            'today' => today()->format('Y-m-d'),
        ]);
    }

    /**
     * Show the form for updating daily rates
     */
    public function create()
    {
        // Get current active rates for today or most recent
        $currentRates = $this->engine->getRatesForCurrency('INR', today());

        $formattedRates = $currentRates->map(fn ($rate) => [
            'currency' => $rate['to_currency'] ?? null,
            'rate' => $rate['rate'] ?? null,
            'lastUpdated' => $rate['effective_date'] ?? null,
        ])->filter(fn ($item) => $item['currency'] !== null);

        return Inertia::render('ExchangeRates/Create', [
            'currentRates' => $formattedRates->toArray(),
            'today' => today()->format('Y-m-d'),
        ]);
    }

    /**
     * Store updated exchange rates for today
     */
    public function store(UpdateExchangeRatesRequest $request)
    {
        $validated = $request->validated();

        try {
            $rates = $validated['rates'];
            $effectiveDate = Carbon::parse($validated['effective_date'] ?? today());

            // Bulk update rates
            $created = $this->engine->bulkUpdateRates(
                $rates,
                'INR',
                $effectiveDate,
                'manual'
            );

            return redirect()
                ->route('exchange-rates.index')
                ->with('success', "Exchange rates updated successfully ({$created->count()} records created)");
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to update rates: '.$e->getMessage()])
                ->withInput();
        }
    }

    /**
     * View historical rates for a currency pair
     */
    public function history(string $fromCurrency, string $toCurrency)
    {
        $history = $this->engine->getHistory($fromCurrency, $toCurrency, 90);

        return Inertia::render('ExchangeRates/History', [
            'fromCurrency' => strtoupper($fromCurrency),
            'toCurrency' => strtoupper($toCurrency),
            'history' => $history,
        ]);
    }

    /**
     * Get rate for a specific date via API
     */
    public function show(Request $request)
    {
        $request->validate([
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $rate = $this->engine->getRate(
            $request->input('from'),
            $request->input('to'),
            $request->input('date')
        );

        if (!$rate) {
            return response()->json(
                ['error' => 'Rate not found for the requested date'],
                404
            );
        }

        return response()->json([
            'from_currency' => strtoupper($request->input('from')),
            'to_currency' => strtoupper($request->input('to')),
            'rate' => $rate,
            'date' => $request->input('date') ?? today()->format('Y-m-d'),
        ]);
    }

    /**
     * Get all rates for a base currency
     */
    public function getRates(Request $request)
    {
        $request->validate([
            'base' => 'required|string|size:3',
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $rates = $this->engine->getRatesForCurrency(
            $request->input('base'),
            $request->input('date')
        );

        return response()->json([
            'base' => strtoupper($request->input('base')),
            'date' => $request->input('date') ?? today()->format('Y-m-d'),
            'rates' => $rates->toArray(),
        ]);
    }

    /**
     * Convert amount between currencies
     */
    public function convert(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|gt:0',
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $converted = $this->engine->convert(
            $request->input('amount'),
            $request->input('from'),
            $request->input('to'),
            $request->input('date')
        );

        if ($converted === null) {
            return response()->json(
                ['error' => 'Cannot convert: exchange rate not found'],
                404
            );
        }

        return response()->json([
            'original' => [
                'amount' => (float) $request->input('amount'),
                'currency' => strtoupper($request->input('from')),
            ],
            'converted' => [
                'amount' => $converted,
                'currency' => strtoupper($request->input('to')),
            ],
            'rate' => $this->engine->getRate(
                $request->input('from'),
                $request->input('to'),
                $request->input('date')
            ),
            'date' => $request->input('date') ?? today()->format('Y-m-d'),
        ]);
    }

    /**
     * Delete a rate record (soft delete via status change)
     */
    public function destroy(int $id)
    {
        $rate = ExchangeRate::findOrFail($id);
        $rate->update(['status' => 'inactive']);

        return redirect()
            ->route('exchange-rates.index')
            ->with('success', 'Exchange rate deactivated successfully');
    }

    /**
     * Batch delete rates for a currency pair
     */
    public function destroyPair(Request $request)
    {
        $request->validate([
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        $deleted = ExchangeRate::where('from_currency', strtoupper($request->input('from')))
            ->where('to_currency', strtoupper($request->input('to')))
            ->update(['status' => 'inactive']);

        return response()->json([
            'success' => true,
            'message' => "{$deleted} records deactivated",
        ]);
    }
}
