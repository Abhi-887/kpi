<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use App\Models\Customer;
use App\Models\MarginRule;
use App\Services\MarginEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarginRuleController extends Controller
{
    public function __construct(private readonly MarginEngine $marginEngine) {}

    /**
     * Display margin rule management UI
     */
    public function index(): Response
    {
        return Inertia::render('MarginEngine/Index', [
            'rules' => MarginRule::query()
                ->with(['charge', 'customer'])
                ->orderByDesc('precedence')
                ->get(),
            'charges' => Charge::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'customers' => Customer::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Get rules for a specific charge-customer combination
     *
     * @return JsonResponse
     */
    public function getRulesForCombination(Request $request): JsonResponse
    {
        $request->validate([
            'charge_id' => 'nullable|integer|exists:charges,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
        ]);

        $chargeId = $request->input('charge_id');
        $customerId = $request->input('customer_id');

        $rules = $this->marginEngine->getRuleHierarchy($chargeId, $customerId);

        return response()->json([
            'hierarchy' => $rules,
            'applicable_rule' => $this->marginEngine->findApplicableMarginRule($chargeId, $customerId),
        ]);
    }

    /**
     * Calculate sale price based on cost and rules
     *
     * @return JsonResponse
     */
    public function calculateSalePrice(Request $request): JsonResponse
    {
        $request->validate([
            'cost_inr' => 'required|numeric|min:0',
            'charge_id' => 'nullable|integer|exists:charges,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
        ]);

        $result = $this->marginEngine->calculateSalePrice(
            $request->input('cost_inr'),
            $request->input('charge_id'),
            $request->input('customer_id')
        );

        return response()->json($result);
    }

    /**
     * Create a new margin rule
     *
     * @return JsonResponse
     */
    public function addMarginRule(Request $request): JsonResponse
    {
        $request->validate([
            'precedence' => 'required|integer|min:0',
            'charge_id' => 'nullable|integer|exists:charges,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'margin_percentage' => 'required|numeric|between:0,1',
            'margin_fixed_inr' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $rule = $this->marginEngine->createRule(
            $request->input('precedence'),
            $request->input('charge_id'),
            $request->input('customer_id'),
            $request->input('margin_percentage'),
            $request->input('margin_fixed_inr'),
            $request->input('notes')
        );

        return response()->json([
            'message' => 'Margin rule created successfully',
            'rule' => $rule->load(['charge', 'customer']),
        ], 201);
    }

    /**
     * Update an existing margin rule
     *
     * @return JsonResponse
     */
    public function updateMarginRule(Request $request, MarginRule $rule): JsonResponse
    {
        $request->validate([
            'precedence' => 'integer|min:0',
            'margin_percentage' => 'numeric|between:0,1',
            'margin_fixed_inr' => 'numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $this->marginEngine->updateRule($rule, $request->only([
            'precedence',
            'margin_percentage',
            'margin_fixed_inr',
            'notes',
        ]));

        return response()->json([
            'message' => 'Margin rule updated successfully',
            'rule' => $rule->load(['charge', 'customer']),
        ]);
    }

    /**
     * Deactivate a margin rule
     *
     * @return JsonResponse
     */
    public function removeMarginRule(Request $request, MarginRule $rule): JsonResponse
    {
        $this->marginEngine->deactivateRule($rule);

        return response()->json([
            'message' => 'Margin rule removed successfully',
        ]);
    }

    /**
     * List all margin rules with optional filtering
     *
     * @return JsonResponse
     */
    public function listAllRules(Request $request): JsonResponse
    {
        $request->validate([
            'only_active' => 'boolean',
            'charge_id' => 'nullable|integer|exists:charges,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
        ]);

        $rules = $this->marginEngine->getAllRules(
            $request->input('only_active', true),
            $request->input('charge_id'),
            $request->input('customer_id')
        );

        return response()->json([
            'rules' => $rules,
            'total' => $rules->count(),
        ]);
    }

    /**
     * Validate margin rules for consistency
     *
     * @return JsonResponse
     */
    public function validateRules(): JsonResponse
    {
        $issues = $this->marginEngine->validateRules();
        $isValid = empty($issues);

        return response()->json([
            'is_valid' => $isValid,
            'issues' => $issues,
            'message' => $isValid ? 'All margin rules are valid' : 'Some issues found in margin rules',
        ]);
    }

    /**
     * Calculate bulk sale prices
     *
     * @return JsonResponse
     */
    public function calculateBulkPrices(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.cost' => 'required|numeric|min:0',
            'items.*.charge_id' => 'nullable|integer|exists:charges,id',
            'items.*.customer_id' => 'nullable|integer|exists:customers,id',
        ]);

        $results = $this->marginEngine->calculateBulkPrices($request->input('items'));

        return response()->json([
            'results' => $results,
            'total_items' => count($results),
        ]);
    }
}
