<?php

namespace Database\Seeders;

use App\Models\Charge;
use Illuminate\Database\Seeder;

class ChargeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $charges = [
            [
                'charge_id' => 'CHG001',
                'charge_code' => 'BL',
                'charge_name' => 'Bill of Lading',
                'default_uom_id' => 2, // Gram (base unit)
                'default_tax_id' => 3, // 12% GST
                'default_fixed_rate_inr' => 500.00,
                'charge_type' => 'fixed',
                'description' => 'Bill of Lading processing charge',
            ],
            [
                'charge_id' => 'CHG002',
                'charge_code' => 'DOC',
                'charge_name' => 'Documentation',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 300.00,
                'charge_type' => 'fixed',
                'description' => 'Documentation and paperwork handling',
            ],
            [
                'charge_id' => 'CHG003',
                'charge_code' => 'BASIC',
                'charge_name' => 'Basic Freight',
                'default_uom_id' => 1, // Kilogram
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => null,
                'charge_type' => 'variable',
                'description' => 'Basic freight charge per kilogram',
            ],
            [
                'charge_id' => 'CHG004',
                'charge_code' => 'FUEL',
                'charge_name' => 'Fuel Surcharge',
                'default_uom_id' => 1,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => null,
                'charge_type' => 'variable',
                'description' => 'Fuel surcharge (variable)',
            ],
            [
                'charge_id' => 'CHG005',
                'charge_code' => 'HAND',
                'charge_name' => 'Handling',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 250.00,
                'charge_type' => 'fixed',
                'description' => 'Cargo handling charge',
            ],
            [
                'charge_id' => 'CHG006',
                'charge_code' => 'THC',
                'charge_name' => 'Terminal Handling Charge',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 400.00,
                'charge_type' => 'fixed',
                'description' => 'Terminal handling charge at port',
            ],
            [
                'charge_id' => 'CHG007',
                'charge_code' => 'PICKUP',
                'charge_name' => 'Pickup',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 600.00,
                'charge_type' => 'fixed',
                'description' => 'Pickup from location',
            ],
            [
                'charge_id' => 'CHG008',
                'charge_code' => 'DELIVERY',
                'charge_name' => 'Delivery',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 700.00,
                'charge_type' => 'fixed',
                'description' => 'Final delivery charge',
            ],
            [
                'charge_id' => 'CHG009',
                'charge_code' => 'ADDR',
                'charge_name' => 'Address Change',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 150.00,
                'charge_type' => 'fixed',
                'description' => 'Charge for address change',
            ],
            [
                'charge_id' => 'CHG010',
                'charge_code' => 'OVER',
                'charge_name' => 'Over Dimensional Charge',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 1000.00,
                'charge_type' => 'fixed',
                'description' => 'Extra charge for over-dimensional cargo',
            ],
            [
                'charge_id' => 'CHG011',
                'charge_code' => 'HAZMAT',
                'charge_name' => 'Hazmat Surcharge',
                'default_uom_id' => 2,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => 2000.00,
                'charge_type' => 'fixed',
                'description' => 'Surcharge for hazardous materials',
            ],
            [
                'charge_id' => 'CHG012',
                'charge_code' => 'INSURANCE',
                'charge_name' => 'Insurance',
                'default_uom_id' => 1,
                'default_tax_id' => 3,
                'default_fixed_rate_inr' => null,
                'charge_type' => 'variable',
                'description' => 'Cargo insurance charge',
            ],
        ];

        foreach ($charges as $charge) {
            Charge::create(array_merge($charge, [
                'is_active' => true,
            ]));
        }
    }
}
