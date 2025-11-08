<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use App\Models\ChargeRule;
use App\Services\ChargeEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChargeRuleController extends Controller
{
    public function __construct(private ChargeEngine $chargeEngine) {}

    /**
     * Display charge applicability rule management interface
     */
    public function index(): Response
    {
        $rules = $this->chargeEngine->getAllRules(onlyActive: false);
        $combinations = $this->chargeEngine->getAllRuleCombinations();
        $charges = Charge::where('is_active', true)
            ->orderBy('charge_code')
            ->get();

        return Inertia::render('ChargeApplicability/Index', [
            'rules' => $rules,
            'combinations' => $combinations,
            'charges' => $charges,
            'modes' => ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL'],
            'movements' => ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL'],
            'commonTerms' => ['ALL_TERMS', 'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'],
        ]);
    }

    /**
     * Get rules for a specific mode-movement-terms combination
     */
    public function getRulesForCombination(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'terms' => 'required|string',
        ]);

        $rules = $this->chargeEngine->getRulesForCombination(
            $validated['mode'],
            $validated['movement'],
            $validated['terms']
        );

        return response()->json([
            'success' => true,
            'data' => $rules->map(fn (ChargeRule $rule) => [
                'id' => $rule->id,
                'charge_id' => $rule->charge_id,
                'charge_code' => $rule->charge->charge_code,
                'charge_name' => $rule->charge->charge_name,
                'is_active' => $rule->is_active,
                'notes' => $rule->notes,
            ]),
        ]);
    }

    /**
     * Add a charge to rules for a specific combination
     */
    public function addChargeToRules(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'terms' => 'required|string',
            'charge_id' => 'required|exists:charges,id',
            'notes' => 'nullable|string',
        ]);

        try {
            $rule = $this->chargeEngine->addChargeToRules(
                $validated['mode'],
                $validated['movement'],
                $validated['terms'],
                $validated['charge_id'],
                $validated['notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Charge added to rules successfully',
                'data' => [
                    'id' => $rule->id,
                    'charge_id' => $rule->charge_id,
                    'mode' => $rule->mode,
                    'movement' => $rule->movement,
                    'terms' => $rule->terms,
                    'is_active' => $rule->is_active,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add charge to rules: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove a charge from rules
     */
    public function removeChargeFromRules(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'terms' => 'required|string',
            'charge_id' => 'required|exists:charges,id',
        ]);

        try {
            $removed = $this->chargeEngine->removeChargeFromRules(
                $validated['mode'],
                $validated['movement'],
                $validated['terms'],
                $validated['charge_id']
            );

            if (!$removed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rule not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Charge removed from rules successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove charge: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get applicable charges for a shipment (API endpoint)
     *
     * This endpoint is called by the Costing Module to determine which charges apply
     */
    public function getApplicableCharges(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'terms' => 'required|string',
        ]);

        try {
            $charges = $this->chargeEngine->getApplicableCharges(
                $validated['mode'],
                $validated['movement'],
                $validated['terms']
            );

            return response()->json([
                'success' => true,
                'data' => $charges->map(fn (Charge $charge) => [
                    'id' => $charge->id,
                    'charge_id' => $charge->charge_id,
                    'charge_code' => $charge->charge_code,
                    'charge_name' => $charge->charge_name,
                    'charge_type' => $charge->charge_type->value,
                    'default_uom_id' => $charge->default_uom_id,
                    'default_uom_symbol' => $charge->defaultUom?->symbol,
                    'default_tax_id' => $charge->default_tax_id,
                    'default_tax_rate' => $charge->defaultTax?->tax_percentage,
                ]),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve applicable charges: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get applicable charge IDs only (fast lookup)
     */
    public function getApplicableChargeIds(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:AIR,SEA,ROAD,RAIL,MULTIMODAL',
            'movement' => 'required|in:IMPORT,EXPORT,DOMESTIC,INTER_MODAL',
            'terms' => 'required|string',
        ]);

        try {
            $chargeIds = $this->chargeEngine->getApplicableChargeIds(
                $validated['mode'],
                $validated['movement'],
                $validated['terms']
            );

            return response()->json([
                'success' => true,
                'data' => $chargeIds,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve charge IDs: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Validate all rules for integrity
     */
    public function validateRules(): JsonResponse
    {
        try {
            $issues = $this->chargeEngine->validateRules();

            return response()->json([
                'success' => true,
                'issues_found' => !empty($issues),
                'issues' => $issues,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate rules: ' . $e->getMessage(),
            ], 422);
        }
    }
}

