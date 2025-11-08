<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles first
        $this->call(RoleSeeder::class);

        // Create test user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        // Assign Admin role to test user
        $user->assignRole('admin');

        // Seed master data (Phase 1)
        $this->call(UnitOfMeasureSeeder::class);
        $this->call(TaxCodeSeeder::class);
        $this->call(ChargeSeeder::class);
        $this->call(ItemSeeder::class);
        $this->call(SupplierSeeder::class);
        $this->call(CostComponentSeeder::class);
        $this->call(PriceListSeeder::class);

        // Seed shipments
        $this->call(ShipmentSeeder::class);

        // Seed customers and orders
        $this->call(CustomerSeeder::class);
        $this->call(OrderSeeder::class);
    }
}
