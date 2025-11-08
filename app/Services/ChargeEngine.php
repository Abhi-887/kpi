<?php

namespace App\Services;

use App\Models\Charge;
use App\Models\ChargeRule;
use Illuminate\Support\Collection;

/**
 * Charge Applicability Engine
 *
 * Central rule-based engine for determining which charges (Particulars) are applicable to a shipment.
 * Replaces complex LIST OF CHARGES.csv spreadsheets.
 *
 * Primary responsibility: Answer the question - "For this shipment's mode, movement, and terms, which charges must be applied?"
 *
 * Key Features:
 * - Rule-based charge determination by mode, movement, and incoterms
 * - Support for universal rules (ALL_TERMS) that apply across all terms
 * - Active/inactive rule management
 * - Efficient query caching and optimization
 */
class ChargeEngine
{
    /**
     * Get all applicable charges for a shipment based on mode, movement, and terms
     *
     * This is the core function that determines which charges must be added to a costing calculation.
     * It queries the ChargeRules table and returns a list of applicable charge IDs.
     *
     * Query Logic:
     * - Match exact mode, movement, and terms
     * - OR match mode, movement with ALL_TERMS (universal rule)
     * - Returns only active rules
     *
     * @param string $mode Transportation mode (AIR, SEA, ROAD, RAIL, MULTIMODAL)
     * @param string $movement Type of movement (IMPORT, EXPORT, DOMESTIC, INTER_MODAL)
     * @param string $terms Incoterms (EXW, FCA, CPT, CIP, DAP, DDP, FOB, CFR, CIF, etc.)
     *
     * @return Collection Collection of Charge models with charge details
     */
    public function getApplicableCharges(string $mode, string $movement, string $terms): Collection
    {
        // Get all applicable rule IDs using two queries combined:
        // 1. Exact match: mode, movement, terms
        // 2. Universal match: mode, movement, ALL_TERMS
        $chargeIds = ChargeRule::query()
            ->select('charge_id')
            ->where('is_active', true)
            ->where('mode', $mode)
            ->where('movement', $movement)
            ->where(function ($query) use ($terms) {
                $query->where('terms', $terms)
                    ->orWhere('terms', 'ALL_TERMS');
            })
            ->distinct()
            ->pluck('charge_id');

        // Fetch full charge details with relationships
        return Charge::query()
            ->with(['defaultUom', 'defaultTax'])
            ->whereIn('id', $chargeIds)
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get applicable charge IDs only (for raw lookups)
     *
     * @param string $mode Transportation mode
     * @param string $movement Type of movement
     * @param string $terms Incoterms
     *
     * @return Collection Collection of charge IDs
     */
    public function getApplicableChargeIds(string $mode, string $movement, string $terms): Collection
    {
        return ChargeRule::query()
            ->select('charge_id')
            ->where('is_active', true)
            ->where('mode', $mode)
            ->where('movement', $movement)
            ->where(function ($query) use ($terms) {
                $query->where('terms', $terms)
                    ->orWhere('terms', 'ALL_TERMS');
            })
            ->distinct()
            ->pluck('charge_id');
    }

    /**
     * Get all rules for a specific mode-movement-terms combination
     *
     * Used by admin interface to display and manage rules
     *
     * @param string $mode Transportation mode
     * @param string $movement Type of movement
     * @param string $terms Incoterms
     *
     * @return Collection Collection of ChargeRule models with charge details
     */
    public function getRulesForCombination(string $mode, string $movement, string $terms): Collection
    {
        return ChargeRule::query()
            ->with('charge')
            ->where('mode', $mode)
            ->where('movement', $movement)
            ->where(function ($query) use ($terms) {
                $query->where('terms', $terms)
                    ->orWhere('terms', 'ALL_TERMS');
            })
            ->orderBy('is_active', 'desc')
            ->orderBy('charge_id')
            ->get();
    }

    /**
     * Get all unique mode-movement-terms combinations
     *
     * Useful for building the admin UI with distinct ruleset options
     *
     * @return Collection Collection of distinct combinations
     */
    public function getAllRuleCombinations(): Collection
    {
        return ChargeRule::query()
            ->select('mode', 'movement', 'terms')
            ->distinct()
            ->where('is_active', true)
            ->orderBy('mode')
            ->orderBy('movement')
            ->orderBy('terms')
            ->get();
    }

    /**
     * Add a charge to a rule set
     *
     * Creates a new rule if it doesn't exist, otherwise updates is_active to true
     *
     * @param string $mode Transportation mode
     * @param string $movement Type of movement
     * @param string $terms Incoterms
     * @param int $chargeId Charge ID to add
     * @param string|null $notes Optional notes about the rule
     *
     * @return ChargeRule The created or updated rule
     */
    public function addChargeToRules(
        string $mode,
        string $movement,
        string $terms,
        int $chargeId,
        ?string $notes = null
    ): ChargeRule {
        return ChargeRule::updateOrCreate(
            [
                'mode' => $mode,
                'movement' => $movement,
                'terms' => $terms,
                'charge_id' => $chargeId,
            ],
            [
                'is_active' => true,
                'notes' => $notes,
            ]
        );
    }

    /**
     * Remove a charge from a rule set
     *
     * Soft-deletes by setting is_active to false
     *
     * @param string $mode Transportation mode
     * @param string $movement Type of movement
     * @param string $terms Incoterms
     * @param int $chargeId Charge ID to remove
     *
     * @return bool True if rule was deactivated
     */
    public function removeChargeFromRules(
        string $mode,
        string $movement,
        string $terms,
        int $chargeId
    ): bool {
        $rule = ChargeRule::where('mode', $mode)
            ->where('movement', $movement)
            ->where('terms', $terms)
            ->where('charge_id', $chargeId)
            ->first();

        if ($rule) {
            $rule->update(['is_active' => false]);
            return true;
        }

        return false;
    }

    /**
     * Get all rules (for admin listing)
     *
     * @param bool $onlyActive Only return active rules
     *
     * @return Collection
     */
    public function getAllRules(bool $onlyActive = true): Collection
    {
        $query = ChargeRule::query()
            ->with('charge')
            ->orderBy('mode')
            ->orderBy('movement')
            ->orderBy('terms');

        if ($onlyActive) {
            $query->where('is_active', true);
        }

        return $query->get();
    }

    /**
     * Validate rule integrity
     *
     * Checks for potential issues:
     * - Invalid charge IDs
     * - Redundant universal rules
     *
     * @return array Array of validation issues found
     */
    public function validateRules(): array
    {
        $issues = [];

        // Check for rules with non-existent charges
        $invalidCharges = ChargeRule::query()
            ->select('id', 'charge_id', 'mode', 'movement', 'terms')
            ->whereNotExists(function ($query) {
                $query->select(1)
                    ->from('charges')
                    ->whereColumn('charges.id', 'charge_rules.charge_id')
                    ->where('charges.is_active', true);
            })
            ->get();

        if ($invalidCharges->isNotEmpty()) {
            $issues[] = [
                'type' => 'invalid_charges',
                'message' => 'Found rules with invalid or inactive charges',
                'count' => $invalidCharges->count(),
                'details' => $invalidCharges->pluck('id')->all(),
            ];
        }

        // Check for redundant ALL_TERMS rules
        // If both specific term and ALL_TERMS exist for same mode-movement-charge, it's redundant
        $specificTerms = ChargeRule::query()
            ->where('terms', '!=', 'ALL_TERMS')
            ->select('mode', 'movement', 'charge_id')
            ->distinct()
            ->get();

        $universalRules = ChargeRule::query()
            ->where('terms', 'ALL_TERMS')
            ->select('mode', 'movement', 'charge_id')
            ->get();

        $redundant = [];
        foreach ($universalRules as $universal) {
            $exists = $specificTerms->where('mode', $universal->mode)
                ->where('movement', $universal->movement)
                ->where('charge_id', $universal->charge_id)
                ->isNotEmpty();

            if ($exists) {
                $redundant[] = [
                    'mode' => $universal->mode,
                    'movement' => $universal->movement,
                    'charge_id' => $universal->charge_id,
                ];
            }
        }

        if (!empty($redundant)) {
            $issues[] = [
                'type' => 'redundant_universal_rules',
                'message' => 'Found ALL_TERMS rules with specific term rules (redundant)',
                'count' => count($redundant),
                'details' => $redundant,
            ];
        }

        return $issues;
    }
}
