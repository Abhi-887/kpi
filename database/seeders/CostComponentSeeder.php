<?php

namespace Database\Seeders;

use App\Models\CostComponent;
use Illuminate\Database\Seeder;

class CostComponentSeeder extends Seeder
{
    public function run(): void
    {
        $costComponents = [
            ['item_id' => 1, 'component_type' => 'Material', 'unit_cost' => 3.00, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            ['item_id' => 1, 'component_type' => 'Labour', 'unit_cost' => 1.50, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            ['item_id' => 1, 'component_type' => 'Overhead', 'unit_cost' => 1.00, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            
            ['item_id' => 2, 'component_type' => 'Material', 'unit_cost' => 8.00, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            ['item_id' => 2, 'component_type' => 'Labour', 'unit_cost' => 2.50, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            ['item_id' => 2, 'component_type' => 'Overhead', 'unit_cost' => 1.50, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            
            ['item_id' => 3, 'component_type' => 'Material', 'unit_cost' => 4.50, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            ['item_id' => 3, 'component_type' => 'Labour', 'unit_cost' => 1.75, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
            ['item_id' => 3, 'component_type' => 'Packaging', 'unit_cost' => 1.75, 'quantity_factor' => 1, 'currency' => 'INR', 'effective_from' => now()],
        ];

        foreach ($costComponents as $component) {
            CostComponent::create($component);
        }
    }
}
