<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\RateCard;
use App\Services\QuotingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function __construct(
        protected QuotingService $quotingService
    ) {}

    public function index()
    {
        $quotes = Quote::with('rateCard', 'createdBy')
            ->when(request('search'), function ($query) {
                return $query->where('reference_number', 'like', '%'.request('search').'%')
                    ->orWhere('origin_country', 'like', '%'.request('search').'%')
                    ->orWhere('destination_country', 'like', '%'.request('search').'%');
            })
            ->when(request('status'), function ($query) {
                return $query->where('status', request('status'));
            })
            ->when(request('service_type'), function ($query) {
                return $query->where('service_type', request('service_type'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate(request('per_page', 50));

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'filters' => request()->only(['search', 'status', 'service_type', 'per_page']),
        ]);
    }

    public function create()
    {
        $rateCards = RateCard::where('status', 'active')
            ->select('id', 'name', 'origin_country', 'destination_country', 'service_type', 'base_rate', 'minimum_charge')
            ->get()
            ->groupBy('service_type');

        return Inertia::render('Quotes/Create', [
            'rateCards' => $rateCards,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'origin_country' => 'required|string|max:100',
            'destination_country' => 'required|string|max:100',
            'service_type' => 'required|in:standard,express,overnight,economy',
            'weight' => 'required|numeric|min:0.01',
            'weight_unit' => 'required|in:kg,lbs',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
        ]);

        try {
            $quote = $this->quotingService->generateQuote(
                originCountry: $validated['origin_country'],
                destinationCountry: $validated['destination_country'],
                serviceType: $validated['service_type'],
                weight: (float) $validated['weight'],
                weightUnit: $validated['weight_unit'],
                currency: $validated['currency'] ?? 'INR',
                createdBy: Auth::user(),
                notes: $validated['notes'] ?? null
            );

            return redirect()->route('quotes.show', $quote)->with('success', 'Quote generated successfully');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Quote $quote)
    {
        $quote->load('items', 'rateCard', 'createdBy');

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
        ]);
    }

    public function edit(Quote $quote)
    {
        $quote->load('items', 'rateCard');

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
        ]);
    }

    public function update(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,accepted,rejected,expired',
            'notes' => 'nullable|string',
        ]);

        $quote->update($validated);

        return redirect()->route('quotes.show', $quote)->with('success', 'Quote updated successfully');
    }

    public function destroy(Quote $quote)
    {
        $quote->delete();

        return redirect()->route('quotes.index')->with('success', 'Quote deleted successfully');
    }
}
