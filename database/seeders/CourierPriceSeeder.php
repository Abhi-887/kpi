<?php

namespace Database\Seeders;

use App\Models\CourierPrice;
use Illuminate\Database\Seeder;

class CourierPriceSeeder extends Seeder
{
    public function run(): void
    {
        $carriers = ['FedEx', 'UPS', 'DHL', 'TNT', 'Aramex', 'Blue Dart', 'Ecom Express', 'First Flight'];
        $serviceTypes = ['standard', 'express', 'overnight', 'economy'];
        $coverageAreas = ['All India', 'Metro Cities', 'North India', 'South India', 'East India', 'West India', 'Tier 2 Cities'];

        $data = [];
        for ($i = 1; $i <= 25; $i++) {
            $carrier = $carriers[array_rand($carriers)];
            $serviceType = $serviceTypes[array_rand($serviceTypes)];
            $coverage = $coverageAreas[array_rand($coverageAreas)];

            $data[] = [
                'name' => "{$carrier} {$serviceType} - {$coverage}",
                'description' => "Courier service by {$carrier} for {$serviceType} delivery in {$coverage}",
                'carrier_name' => $carrier,
                'service_type' => $serviceType,
                'base_price' => rand(1000, 10000) / 100,
                'per_kg_price' => rand(200, 2000) / 100,
                'surcharge' => rand(100, 500) / 100,
                'transit_days' => rand(1, 15),
                'coverage_area' => $coverage,
                'is_active' => rand(0, 1),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        CourierPrice::insert($data);
    }
}
