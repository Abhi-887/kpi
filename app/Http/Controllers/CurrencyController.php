<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Currency::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('currency_code', 'like', "%{$search}%")
                    ->orWhere('currency_name', 'like', "%{$search}%")
                    ->orWhere('symbol', 'like', "%{$search}%");
            });
        }

        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $currencies = $query->orderBy('currency_code')->paginate(15);

        return Inertia::render('Currencies/Index', [
            'currencies' => $currencies,
            'filters' => $request->only(['search', 'active']),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function store(StoreCurrencyRequest $request)
    {
        $validated = $request->validated();

        // If this is set as base currency, unset any existing base currency
        if ($validated['is_base_currency'] ?? false) {
            Currency::where('is_base_currency', true)->update(['is_base_currency' => false]);
        }

        Currency::create($validated);

        if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            return response()->json(['success' => true], 201);
        }

        return redirect()->route('currencies.index')->with('success', 'Currency created successfully');
    }

    public function update(UpdateCurrencyRequest $request, Currency $currency)
    {
        $validated = $request->validated();

        // If this is set as base currency, unset any existing base currency
        if (($validated['is_base_currency'] ?? false) && ! $currency->is_base_currency) {
            Currency::where('is_base_currency', true)->update(['is_base_currency' => false]);
        }

        $currency->update($validated);

        if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            return response()->json(['success' => true], 200);
        }

        return redirect()->route('currencies.index')->with('success', 'Currency updated successfully');
    }

    public function destroy(Request $request, Currency $currency)
    {
        // Prevent deleting base currency
        if ($currency->is_base_currency) {
            if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
                return response()->json([
                    'error' => 'Cannot delete the base currency. Please set another currency as base first.',
                ], 422);
            }

            return redirect()->route('currencies.index')
                ->with('error', 'Cannot delete the base currency. Please set another currency as base first.');
        }

        $currency->delete();

        if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            return response()->json(['success' => true], 200);
        }

        return redirect()->route('currencies.index')->with('success', 'Currency deleted successfully');
    }
}
