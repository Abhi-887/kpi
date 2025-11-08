<?php

namespace App\Http\Controllers;

use App\Services\TaxCalculationEngine;
use Illuminate\Http\JsonResponse;
use Inertia\Response;
use Inertia\ResponseFactory;

class TaxCalculationEngineController extends Controller
{
    public function __construct(private readonly TaxCalculationEngine $taxEngine) {}

    /**
     * Display the Tax Calculation Engine dashboard.
     */
    public function index(): Response|ResponseFactory
    {
        return inertia('TaxCalculationEngine/Index', [
            'charges' => $this->taxEngine->getActiveCharges(),
            'taxCodes' => $this->taxEngine->getActiveTaxCodes(),
        ]);
    }

    /**
     * Calculate tax for a single line item.
     */
    public function calculate(): JsonResponse
    {
        try {
            $validated = request()->validate([
                'sale_price' => 'required|numeric|min:0',
                'charge_id' => 'required|integer|exists:charges,id',
            ]);

            $result = $this->taxEngine->getTaxAmount(
                (float) $validated['sale_price'],
                (int) $validated['charge_id']
            );

            return response()->json([
                'success' => true,
                'data' => $result,
                'error' => null,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Calculate tax for multiple line items (batch operation).
     */
    public function calculateBatch(): JsonResponse
    {
        try {
            $validated = request()->validate([
                'items' => 'required|array|min:1',
                'items.*.sale_price' => 'required|numeric|min:0',
                'items.*.charge_id' => 'required|integer|exists:charges,id',
            ]);

            $result = $this->taxEngine->getTaxBreakdown($validated['items']);

            return response()->json([
                'success' => true,
                'data' => $result,
                'error' => null,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
