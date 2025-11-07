<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['item_code' => 'ITEM-001', 'sku' => 'SKU-001', 'name' => 'Cardboard Box A4', 'category' => 'Packaging', 'unit_of_measure_id' => 4, 'default_cost' => 5.50, 'default_price' => 8.75],
            ['item_code' => 'ITEM-002', 'sku' => 'SKU-002', 'name' => 'Kraft Paper Roll', 'category' => 'Packaging', 'unit_of_measure_id' => 1, 'default_cost' => 12.00, 'default_price' => 18.50],
            ['item_code' => 'ITEM-003', 'sku' => 'SKU-003', 'name' => 'Bubble Wrap 1m', 'category' => 'Packaging', 'unit_of_measure_id' => 2, 'default_cost' => 8.00, 'default_price' => 12.00],
            ['item_code' => 'ITEM-004', 'sku' => 'SKU-004', 'name' => 'Packing Tape', 'category' => 'Packaging', 'unit_of_measure_id' => 4, 'default_cost' => 4.50, 'default_price' => 7.00],
            ['item_code' => 'ITEM-005', 'sku' => 'SKU-005', 'name' => 'Polybag Small', 'category' => 'Packaging', 'unit_of_measure_id' => 4, 'default_cost' => 2.25, 'default_price' => 3.50],
            ['item_code' => 'ITEM-006', 'sku' => 'SKU-006', 'name' => 'Polybag Large', 'category' => 'Packaging', 'unit_of_measure_id' => 4, 'default_cost' => 3.75, 'default_price' => 5.75],
            ['item_code' => 'ITEM-007', 'sku' => 'SKU-007', 'name' => 'Foam Sheet 5mm', 'category' => 'Packaging', 'unit_of_measure_id' => 3, 'default_cost' => 150.00, 'default_price' => 225.00],
            ['item_code' => 'ITEM-008', 'sku' => 'SKU-008', 'name' => 'Tissue Paper Pack', 'category' => 'Packaging', 'unit_of_measure_id' => 4, 'default_cost' => 6.00, 'default_price' => 9.50],
            ['item_code' => 'ITEM-009', 'sku' => 'SKU-009', 'name' => 'Corrugated Box Medium', 'category' => 'Packaging', 'unit_of_measure_id' => 4, 'default_cost' => 8.50, 'default_price' => 13.00],
            ['item_code' => 'ITEM-010', 'sku' => 'SKU-010', 'name' => 'Corrugated Box Large', 'category' => 'Packaging', 'unit_of_measure_id' => 4, 'default_cost' => 12.50, 'default_price' => 19.00],
        ];

        foreach ($items as $item) {
            Item::create($item);
        }
    }
}
