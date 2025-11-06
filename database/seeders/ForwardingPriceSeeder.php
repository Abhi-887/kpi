<?php

namespace Database\Seeders;

use App\Models\ForwardingPrice;
use Illuminate\Database\Seeder;

class ForwardingPriceSeeder extends Seeder
{
    public function run(): void
    {
        $countries = ['India', 'USA', 'UK', 'Japan', 'Singapore', 'Australia', 'Canada', 'Germany', 'France', 'UAE'];
        $serviceTypes = ['standard', 'express', 'overnight', 'economy'];

        $data = [];
        for ($i = 1; $i <= 30; $i++) {
            $origin = $countries[array_rand($countries)];
            $destination = $countries[array_rand($countries)];
            while ($destination === $origin) {
                $destination = $countries[array_rand($countries)];
            }

            $data[] = [
                'name' => "Forwarding - {$origin} to {$destination}",
                'description' => "Forwarding service from {$origin} to {$destination}",
                'origin_country' => $origin,
                'destination_country' => $destination,
                'service_type' => $serviceTypes[array_rand($serviceTypes)],
                'base_price' => rand(5000, 50000) / 100,
                'per_kg_price' => rand(500, 5000) / 100,
                'per_cbm_price' => rand(2000, 20000) / 100,
                'handling_fee' => rand(100, 1000) / 100,
                'transit_days' => rand(5, 45),
                'is_active' => rand(0, 1),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        ForwardingPrice::insert($data);
    }
}
