<?php

namespace Database\Seeders;

use App\Models\Shipment;
use Illuminate\Database\Seeder;

class ShipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed 5000 shipments (can be increased to 40K+ if needed)
        // Using chunking for better performance
        Shipment::factory(5000)->create();

        // Also create some specific states for testing
        Shipment::factory(100)->delivered()->create();
        Shipment::factory(50)->inTransit()->create();
        Shipment::factory(25)->pending()->create();
    }
}
