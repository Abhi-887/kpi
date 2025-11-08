<?php

namespace Database\Seeders;

use App\Models\Charge;
use App\Models\ChargeRule;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChargeRuleSeeder extends Seeder
{
    /**
     * Charge Applicability Rules
     *
     * Defines which charges (Particulars) are applicable for each mode-movement-terms combination.
     * This replaces the complex LIST OF CHARGES.csv spreadsheets.
     *
     * Rules structure:
     * - AIR + IMPORT + ALL_TERMS: Standard air import charges
     * - AIR + EXPORT + ALL_TERMS: Standard air export charges
     * - SEA + IMPORT + ALL_TERMS: Standard sea import charges
     * - SEA + EXPORT + ALL_TERMS: Standard sea export charges
     * - ROAD/RAIL: Basic domestic charges
     * - MULTIMODAL: Comprehensive charges for combined movements
     */
    public function run(): void
    {
        // Get all active charges for reference
        $charges = Charge::where('is_active', true)->get()->keyBy('charge_code');

        // Define charge applicability rules
        $rules = [];

        // ========== AIR IMPORT RULES ==========
        $airImportCharges = ['BL', 'DOC', 'BASIC', 'FUEL', 'HAND', 'PICKUP', 'THC'];
        foreach ($airImportCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'AIR',
                    'movement' => 'IMPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // ========== AIR EXPORT RULES ==========
        $airExportCharges = ['BL', 'DOC', 'BASIC', 'FUEL', 'HAND', 'DELIVERY', 'THC'];
        foreach ($airExportCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'AIR',
                    'movement' => 'EXPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // ========== SEA IMPORT RULES ==========
        $seaImportCharges = ['BL', 'DOC', 'BASIC', 'HAND', 'PICKUP', 'THC', 'OVER'];
        foreach ($seaImportCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'SEA',
                    'movement' => 'IMPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // ========== SEA EXPORT RULES ==========
        $seaExportCharges = ['BL', 'DOC', 'BASIC', 'HAND', 'DELIVERY', 'THC', 'OVER'];
        foreach ($seaExportCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'SEA',
                    'movement' => 'EXPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // ========== ROAD IMPORT RULES ==========
        $roadImportCharges = ['BL', 'BASIC', 'HAND', 'PICKUP'];
        foreach ($roadImportCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'ROAD',
                    'movement' => 'IMPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // ========== ROAD EXPORT RULES ==========
        $roadExportCharges = ['BL', 'BASIC', 'HAND', 'DELIVERY'];
        foreach ($roadExportCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'ROAD',
                    'movement' => 'EXPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // ========== DOMESTIC RULES ==========
        $domesticCharges = ['BASIC', 'HAND', 'ADDR'];
        foreach ($domesticCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'ROAD',
                    'movement' => 'DOMESTIC',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // ========== MULTIMODAL RULES ==========
        $multimodalCharges = ['BL', 'DOC', 'BASIC', 'FUEL', 'HAND', 'THC', 'HAZMAT', 'INSURANCE'];
        foreach ($multimodalCharges as $code) {
            if (isset($charges[$code])) {
                $rules[] = [
                    'mode' => 'MULTIMODAL',
                    'movement' => 'IMPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];

                $rules[] = [
                    'mode' => 'MULTIMODAL',
                    'movement' => 'EXPORT',
                    'terms' => 'ALL_TERMS',
                    'charge_id' => $charges[$code]->id,
                ];
            }
        }

        // Batch insert rules
        if (!empty($rules)) {
            ChargeRule::insert($rules);
        }
    }
}

