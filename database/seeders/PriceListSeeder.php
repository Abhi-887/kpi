<?php

namespace Database\Seeders;

use App\Models\PriceList;
use Illuminate\Database\Seeder;

class PriceListSeeder extends Seeder
{
    public function run(): void
    {
        $priceLists = [
            ['item_id' => 1, 'valid_from' => now(), 'base_price' => 8.75, 'min_qty' => 1, 'max_qty' => 100, 'customer_group' => 'Retail', 'discount_percent' => 0, 'currency' => 'INR', 'is_active' => true],
            ['item_id' => 1, 'valid_from' => now(), 'base_price' => 8.75, 'min_qty' => 101, 'max_qty' => 500, 'customer_group' => 'Retail', 'discount_percent' => 5, 'currency' => 'INR', 'is_active' => true],
            ['item_id' => 1, 'valid_from' => now(), 'base_price' => 8.75, 'min_qty' => 501, 'max_qty' => null, 'customer_group' => 'Retail', 'discount_percent' => 10, 'currency' => 'INR', 'is_active' => true],
            
            ['item_id' => 2, 'valid_from' => now(), 'base_price' => 18.50, 'min_qty' => 1, 'max_qty' => 50, 'customer_group' => 'Wholesale', 'discount_percent' => 0, 'currency' => 'INR', 'is_active' => true],
            ['item_id' => 2, 'valid_from' => now(), 'base_price' => 18.50, 'min_qty' => 51, 'max_qty' => 200, 'customer_group' => 'Wholesale', 'discount_percent' => 8, 'currency' => 'INR', 'is_active' => true],
            ['item_id' => 2, 'valid_from' => now(), 'base_price' => 18.50, 'min_qty' => 201, 'max_qty' => null, 'customer_group' => 'Wholesale', 'discount_percent' => 15, 'currency' => 'INR', 'is_active' => true],
            
            ['item_id' => 3, 'valid_from' => now(), 'base_price' => 12.00, 'min_qty' => 1, 'max_qty' => 100, 'discount_percent' => 0, 'currency' => 'INR', 'is_active' => true],
            ['item_id' => 3, 'valid_from' => now(), 'base_price' => 12.00, 'min_qty' => 101, 'max_qty' => 300, 'discount_percent' => 7, 'currency' => 'INR', 'is_active' => true],
        ];

        foreach ($priceLists as $priceList) {
            PriceList::create($priceList);
        }
    }
}
