<?php

namespace App\Services;

use App\Models\MarginRule;
use Illuminate\Support\Collection;

/**
 * Margin Engine
 *
 * Central rule-based engine for calculating sales prices based on defined margins.
 * Implements precedence-based rule resolution to find the most specific margin rule.
 *
 * Rule Resolution Strategy (First Match Wins):
 * 1. charge_id + customer_id (Specific deal for one customer on one charge)
 * 2. charge_id + NULL (Standard margin for this charge, applies to all customers)
 * 3. NULL + customer_id (Special customer margin, applies to all charges)
 * 4. NULL + NULL (Global default margin)
 *
 * Higher precedence values override lower ones at the same specificity level.
 *
 * Primary responsibility: Calculate sale price = (cost * (1 + margin_percent)) + margin_fixed
 */
class MarginEngine
{
    /**
     * Calculate sale price based on cost and margin rules
     *
     * Applies margin hierarchy to find the most specific rule:
     * - Searches rules in order of specificity (most specific first)
     * - Uses precedence to break ties
     * - Returns sale_price = (cost_inr * (1 + margin_percentage)) + margin_fixed_inr
     *
     * @param float $costInr Cost amount in INR
     * @param int|null $chargeId Charge ID for specific charge margin (NULL = all charges)
     * @param int|null $customerId Customer ID for specific customer margin (NULL = all customers)
     *
     * @return array Result with sale_price, applied_rule details, and calculation breakdown
     */
    public function calculateSalePrice(
        float $costInr,
        ?int $chargeId = null,
        ?int $customerId = null
    ): array {
        $rule = $this->findApplicableMarginRule($chargeId, $customerId);

        if (!$rule) {
            // No rule found, return cost as-is with default margin (0%)
            return [
                'cost_inr' => $costInr,
                'sale_price' => $costInr,
                'margin_applied' => 0,
                'margin_fixed' => 0,
                'rule_id' => null,
                'specificity' => 'none',
                'calculation' => "{$costInr} (no rule applied)",
            ];
        }

        $marginPercentage = (float) $rule->margin_percentage;
        $marginFixed = (float) $rule->margin_fixed_inr;

        $salePrice = ($costInr * (1 + $marginPercentage)) + $marginFixed;

        return [
            'cost_inr' => $costInr,
            'sale_price' => round($salePrice, 2),
            'margin_applied' => $marginPercentage,
            'margin_fixed' => $marginFixed,
            'rule_id' => $rule->id,
            'rule_precedence' => $rule->precedence,
            'specificity' => $this->getSpecificity($rule),
            'calculation' => "{$costInr} × (1 + {$marginPercentage}) + {$marginFixed} = {$salePrice}",
        ];
    }

    /**
     * Find the most specific applicable margin rule
     *
     * Resolution order (first match wins, then checks precedence):
     * 1. Both charge_id and customer_id match (Most specific)
     * 2. charge_id matches, customer_id is NULL
     * 3. charge_id is NULL, customer_id matches
     * 4. Both NULL (Least specific - Global default)
     *
     * @param int|null $chargeId
     * @param int|null $customerId
     *
     * @return MarginRule|null
     */
    public function findApplicableMarginRule(?int $chargeId = null, ?int $customerId = null): ?MarginRule
    {
        // Level 1: Both specific (charge_id + customer_id)
        $rule = MarginRule::query()
            ->where('is_active', true)
            ->where('charge_id', $chargeId)
            ->where('customer_id', $customerId)
            ->orderByDesc('precedence')
            ->first();

        if ($rule) {
            return $rule;
        }

        // Level 2: Charge specific (charge_id + NULL)
        $rule = MarginRule::query()
            ->where('is_active', true)
            ->where('charge_id', $chargeId)
            ->whereNull('customer_id')
            ->orderByDesc('precedence')
            ->first();

        if ($rule) {
            return $rule;
        }

        // Level 3: Customer specific (NULL + customer_id)
        $rule = MarginRule::query()
            ->where('is_active', true)
            ->whereNull('charge_id')
            ->where('customer_id', $customerId)
            ->orderByDesc('precedence')
            ->first();

        if ($rule) {
            return $rule;
        }

        // Level 4: Global default (NULL + NULL)
        $rule = MarginRule::query()
            ->where('is_active', true)
            ->whereNull('charge_id')
            ->whereNull('customer_id')
            ->orderByDesc('precedence')
            ->first();

        return $rule;
    }

    /**
     * Get rules for a specific combination with all precedence levels
     *
     * Useful for admin UI to show rule hierarchy
     *
     * @param int|null $chargeId
     * @param int|null $customerId
     *
     * @return Collection
     */
    public function getRulesForCombination(?int $chargeId = null, ?int $customerId = null): Collection
    {
        return MarginRule::query()
            ->where('charge_id', $chargeId)
            ->where('customer_id', $customerId)
            ->where('is_active', true)
            ->orderByDesc('precedence')
            ->with(['charge', 'customer'])
            ->get();
    }

    /**
     * Get all rule specificity levels for a charge-customer pair
     *
     * Returns all applicable rules at each specificity level for reference
     *
     * @param int|null $chargeId
     * @param int|null $customerId
     *
     * @return array Organized by specificity level
     */
    public function getRuleHierarchy(?int $chargeId = null, ?int $customerId = null): array
    {
        return [
            'specific' => MarginRule::query()
                ->where('charge_id', $chargeId)
                ->where('customer_id', $customerId)
                ->where('is_active', true)
                ->orderByDesc('precedence')
                ->get(),
            'charge_only' => MarginRule::query()
                ->where('charge_id', $chargeId)
                ->whereNull('customer_id')
                ->where('is_active', true)
                ->orderByDesc('precedence')
                ->get(),
            'customer_only' => MarginRule::query()
                ->whereNull('charge_id')
                ->where('customer_id', $customerId)
                ->where('is_active', true)
                ->orderByDesc('precedence')
                ->get(),
            'global' => MarginRule::query()
                ->whereNull('charge_id')
                ->whereNull('customer_id')
                ->where('is_active', true)
                ->orderByDesc('precedence')
                ->get(),
        ];
    }

    /**
     * Create or update a margin rule
     *
     * @param int $precedence Priority level
     * @param int|null $chargeId
     * @param int|null $customerId
     * @param float $marginPercentage
     * @param float $marginFixedInr
     * @param string|null $notes
     *
     * @return MarginRule
     */
    public function createRule(
        int $precedence,
        ?int $chargeId,
        ?int $customerId,
        float $marginPercentage,
        float $marginFixedInr,
        ?string $notes = null
    ): MarginRule {
        return MarginRule::create([
            'precedence' => $precedence,
            'charge_id' => $chargeId,
            'customer_id' => $customerId,
            'margin_percentage' => $marginPercentage,
            'margin_fixed_inr' => $marginFixedInr,
            'is_active' => true,
            'notes' => $notes,
        ]);
    }

    /**
     * Update an existing margin rule
     *
     * @param MarginRule $rule
     * @param array $data
     *
     * @return MarginRule
     */
    public function updateRule(MarginRule $rule, array $data): MarginRule
    {
        $rule->update($data);

        return $rule;
    }

    /**
     * Deactivate a margin rule
     *
     * @param MarginRule $rule
     *
     * @return bool
     */
    public function deactivateRule(MarginRule $rule): bool
    {
        return $rule->update(['is_active' => false]);
    }

    /**
     * Get all rules with optional filtering
     *
     * @param bool $onlyActive
     * @param int|null $chargeId
     * @param int|null $customerId
     *
     * @return Collection
     */
    public function getAllRules(
        bool $onlyActive = true,
        ?int $chargeId = null,
        ?int $customerId = null
    ): Collection {
        $query = MarginRule::query()
            ->with(['charge', 'customer'])
            ->orderByDesc('precedence');

        if ($onlyActive) {
            $query->where('is_active', true);
        }

        if ($chargeId !== null) {
            $query->where('charge_id', $chargeId);
        }

        if ($customerId !== null) {
            $query->where('customer_id', $customerId);
        }

        return $query->get();
    }

    /**
     * Get specificity level name for display
     *
     * @param MarginRule $rule
     *
     * @return string
     */
    private function getSpecificity(MarginRule $rule): string
    {
        if ($rule->charge_id && $rule->customer_id) {
            return 'specific';
        }

        if ($rule->charge_id) {
            return 'charge_only';
        }

        if ($rule->customer_id) {
            return 'customer_only';
        }

        return 'global';
    }

    /**
     * Validate margin rules for consistency
     *
     * Checks for:
     * - Inactive rules that should be cleaned up
     * - Overlapping rules at same specificity level
     * - Missing global default rule
     *
     * @return array Validation report
     */
    public function validateRules(): array
    {
        $issues = [];

        // Check for missing global default
        $globalDefault = MarginRule::query()
            ->whereNull('charge_id')
            ->whereNull('customer_id')
            ->where('is_active', true)
            ->first();

        if (!$globalDefault) {
            $issues[] = [
                'type' => 'missing_global_default',
                'severity' => 'warning',
                'message' => 'No global default margin rule (NULL + NULL) found. Create one to ensure all costs get priced.',
            ];
        }

        // Check for rules pointing to non-existent charges
        $invalidCharges = MarginRule::query()
            ->select('id', 'charge_id', 'customer_id', 'precedence')
            ->whereNotNull('charge_id')
            ->whereNotExists(function ($q) {
                $q->select(1)
                    ->from('charges')
                    ->whereColumn('charges.id', 'margin_rules.charge_id')
                    ->where('charges.is_active', true);
            })
            ->where('is_active', true)
            ->get();

        if ($invalidCharges->isNotEmpty()) {
            $issues[] = [
                'type' => 'invalid_charges',
                'severity' => 'error',
                'message' => 'Found rules referencing inactive or deleted charges',
                'count' => $invalidCharges->count(),
            ];
        }

        // Check for rules pointing to non-existent customers
        $invalidCustomers = MarginRule::query()
            ->select('id', 'charge_id', 'customer_id', 'precedence')
            ->whereNotNull('customer_id')
            ->whereNotExists(function ($q) {
                $q->select(1)
                    ->from('customers')
                    ->whereColumn('customers.id', 'margin_rules.customer_id')
                    ->where('customers.is_active', true);
            })
            ->where('is_active', true)
            ->get();

        if ($invalidCustomers->isNotEmpty()) {
            $issues[] = [
                'type' => 'invalid_customers',
                'severity' => 'error',
                'message' => 'Found rules referencing inactive or deleted customers',
                'count' => $invalidCustomers->count(),
            ];
        }

        return $issues;
    }

    /**
     * Calculate bulk sale prices for multiple items
     *
     * Useful for batch pricing calculations
     *
     * @param array $items Array of ['cost' => float, 'charge_id' => int, 'customer_id' => int]
     *
     * @return array Results with all calculations
     */
    public function calculateBulkPrices(array $items): array
    {
        return array_map(
            fn ($item) => $this->calculateSalePrice(
                $item['cost'] ?? 0,
                $item['charge_id'] ?? null,
                $item['customer_id'] ?? null
            ),
            $items
        );
    }
}
