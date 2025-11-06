<?php

namespace Database\Seeders;

use App\Models\PackagingPrice;
use Illuminate\Database\Seeder;

class PackagingPriceSeeder extends Seeder
{
    public function run(): void
    {
        $packageTypes = ['box', 'envelope', 'tube', 'crate', 'pallet'];
        $sizeCategories = ['small', 'medium', 'large', 'xlarge'];
        $materials = ['Cardboard', 'Plastic', 'Wood', 'Paper', 'Foam', 'Metal', 'Corrugated Cardboard'];

        $data = [];
        for ($i = 1; $i <= 20; $i++) {
            $type = $packageTypes[array_rand($packageTypes)];
            $size = $sizeCategories[array_rand($sizeCategories)];
            $material = $materials[array_rand($materials)];

            $data[] = [
                'name' => ucfirst($type) . " - " . ucfirst($size) . " ({$material})",
                'description' => "Packaging for {$type} in {$size} size made of {$material}",
                'package_type' => $type,
                'size_category' => $size,
                'length' => rand(10, 100),
                'width' => rand(10, 100),
                'height' => rand(10, 100),
                'max_weight' => rand(5, 50),
                'unit_price' => rand(50, 500) / 100,
                'bulk_price_5' => rand(40, 450) / 100,
                'bulk_price_10' => rand(30, 400) / 100,
                'material' => $material,
                'is_active' => rand(0, 1),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        PackagingPrice::insert($data);
    }
}
