<?php

namespace Database\Seeders;

use App\Models\Charge;
use App\Models\Customer;
use App\Models\MarginRule;
use Illuminate\Database\Seeder;

class MarginRuleSeeder extends Seeder
{
    /**
     * Seed the margin rules table.
     *
     * Creates a comprehensive set of default margin rules following precedence strategy:
     * - Precedence 1: Global default (applies to all charges, all customers)
     * - Precedence 2: Customer-specific margins
     * - Precedence 3: Charge-specific margins
     * - Precedence 4: Specific deal (charge + customer combo)
     */
    public function run(): void
    {
        // Get reference data
        $charges = Charge::where('is_active', true)->get();
        $customers = Customer::limit(5)->get();

        // Level 1: Global Default Margins (Precedence 1)
        // These apply to ALL charges for ALL customers
        MarginRule::create([
            'precedence' => 1,
            'charge_id' => null,
            'customer_id' => null,
            'margin_percentage' => 0.20,  // 20% standard markup
            'margin_fixed_inr' => 0,
            'is_active' => true,
            'notes' => 'Global default margin: 20% standard markup applied to all charges',
        ]);

        // Level 2: Customer-Specific Margins (Precedence 2)
        // Premium customers get lower markup (higher volume discount)
        if ($customers->isNotEmpty()) {
            $premiumCustomer = $customers->first();
            if ($premiumCustomer) {
                MarginRule::create([
                    'precedence' => 2,
                    'charge_id' => null,
                    'customer_id' => $premiumCustomer->id,
                    'margin_percentage' => 0.10,  // 10% for premium customer
                    'margin_fixed_inr' => 0,
                    'is_active' => true,
                    'notes' => "Special margin for {$premiumCustomer->name}: 10% (volume discount)",
                ]);
            }

            // Regular customers get standard margin
            if ($customers->count() >= 2) {
                $regularCustomer = $customers->get(1);
                MarginRule::create([
                    'precedence' => 2,
                    'charge_id' => null,
                    'customer_id' => $regularCustomer->id,
                    'margin_percentage' => 0.15,  // 15% for regular customer
                    'margin_fixed_inr' => 0,
                    'is_active' => true,
                    'notes' => "Special margin for {$regularCustomer->name}: 15% (regular customer)",
                ]);
            }
        }

        // Level 3: Charge-Specific Margins (Precedence 3)
        // High-value charges get higher markup
        if ($charges->isNotEmpty()) {
            // High margin charges (premium services like FUEL, THC, HAZMAT)
            $premiumCharges = $charges->filter(function ($charge) {
                return in_array($charge->code, ['FUEL', 'THC', 'HAZMAT', 'INSURANCE']);
            });

            foreach ($premiumCharges as $charge) {
                MarginRule::create([
                    'precedence' => 3,
                    'charge_id' => $charge->id,
                    'customer_id' => null,
                    'margin_percentage' => 0.25,  // 25% for premium charges
                    'margin_fixed_inr' => 100,    // Plus 100 Rs fixed
                    'is_active' => true,
                    'notes' => "{$charge->name}: 25% + 100 Rs (premium charge)",
                ]);
            }

            // Standard charges get standard margin
            $standardCharges = $charges->filter(function ($charge) {
                return in_array($charge->code, ['BASIC', 'DOC', 'BL', 'HAND']);
            });

            foreach ($standardCharges as $charge) {
                MarginRule::create([
                    'precedence' => 3,
                    'charge_id' => $charge->id,
                    'customer_id' => null,
                    'margin_percentage' => 0.20,  // 20% for standard charges
                    'margin_fixed_inr' => 0,
                    'is_active' => true,
                    'notes' => "{$charge->name}: 20% standard margin",
                ]);
            }
        }

        // Level 4: Specific Deal Margins (Precedence 4)
        // Most specific: charge + customer combination
        if ($charges->isNotEmpty() && $customers->isNotEmpty()) {
            $premiumCustomer = $customers->first();
            $basicCharge = $charges->firstWhere('code', 'BASIC');
            $fuelCharge = $charges->firstWhere('code', 'FUEL');

            // Special deal: Premium customer + Basic charge = lower margin
            if ($premiumCustomer && $basicCharge) {
                MarginRule::create([
                    'precedence' => 4,
                    'charge_id' => $basicCharge->id,
                    'customer_id' => $premiumCustomer->id,
                    'margin_percentage' => 0.08,  // 8% for this specific combo
                    'margin_fixed_inr' => 0,
                    'is_active' => true,
                    'notes' => "Deal: {$premiumCustomer->name} + {$basicCharge->name} = 8% margin",
                ]);
            }

            // Special deal: Premium customer + Fuel charge = volume pricing
            if ($premiumCustomer && $fuelCharge) {
                MarginRule::create([
                    'precedence' => 4,
                    'charge_id' => $fuelCharge->id,
                    'customer_id' => $premiumCustomer->id,
                    'margin_percentage' => 0.15,  // 15% for this combo
                    'margin_fixed_inr' => 50,    // Plus 50 Rs fixed
                    'is_active' => true,
                    'notes' => "Deal: {$premiumCustomer->name} + {$fuelCharge->name} = 15% + 50 Rs",
                ]);
            }
        }
    }
}
