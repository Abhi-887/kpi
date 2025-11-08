<?php

namespace App\Http\Controllers;

use App\Services\FormulaEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormulaCalculatorController extends Controller
{
    public function __construct(private FormulaEngine $formulaEngine) {}

    /**
     * Show the formula calculator interface
     */
    public function index(): Response
    {
        return Inertia::render('FormulaEngine/Index', [
            'supportedModes' => $this->formulaEngine->getSupportedModes(),
        ]);
    }

    /**
     * Calculate CBM
     */
    public function calculateCBM(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'length' => ['required', 'numeric', 'min:0.01'],
            'width' => ['required', 'numeric', 'min:0.01'],
            'height' => ['required', 'numeric', 'min:0.01'],
            'pieces' => ['nullable', 'numeric', 'min:1'],
        ]);

        try {
            $cbm = $this->formulaEngine->calculateCBM(
                $validated['length'],
                $validated['width'],
                $validated['height'],
                $validated['pieces'] ?? 1
            );

            $pieces = $validated['pieces'] ?? 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'cbm' => round($cbm, 6),
                    'calculation' => "({$validated['length']} × {$validated['width']} × {$validated['height']} × {$pieces}) / 1,000,000",
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Calculate Volumetric Weight
     */
    public function calculateVolumetricWeight(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cbm' => ['required', 'numeric', 'min:0'],
            'mode' => ['required', 'string'],
        ]);

        try {
            $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(
                $validated['cbm'],
                $validated['mode']
            );

            $modes = $this->formulaEngine->getSupportedModes();
            $factor = $modes[$validated['mode']]['factor'] ?? null;

            return response()->json([
                'success' => true,
                'data' => [
                    'volumetric_weight' => round($volumetricWeight, 2),
                    'calculation' => "{$validated['cbm']} CBM × {$factor}",
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Calculate Chargeable Weight
     */
    public function calculateChargeableWeight(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'actual_weight' => ['required', 'numeric', 'min:0'],
            'volumetric_weight' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $chargeableWeight = $this->formulaEngine->getChargeableWeight(
                $validated['actual_weight'],
                $validated['volumetric_weight']
            );

            $weightType = $chargeableWeight === $validated['volumetric_weight'] ? 'Volumetric' : 'Actual';

            return response()->json([
                'success' => true,
                'data' => [
                    'chargeable_weight' => round($chargeableWeight, 2),
                    'weight_type' => $weightType,
                    'calculation' => "max({$validated['actual_weight']}, {$validated['volumetric_weight']})",
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Calculate all metrics at once
     */
    public function calculateAll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'length' => ['required', 'numeric', 'min:0.01'],
            'width' => ['required', 'numeric', 'min:0.01'],
            'height' => ['required', 'numeric', 'min:0.01'],
            'pieces' => ['nullable', 'numeric', 'min:1'],
            'actual_weight' => ['required', 'numeric', 'min:0'],
            'mode' => ['required', 'string'],
        ]);

        try {
            $result = $this->formulaEngine->calculateAll($validated);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}
