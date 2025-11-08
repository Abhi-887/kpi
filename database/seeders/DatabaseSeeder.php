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

        // Create additional users
        $this->call(UserSeeder::class);

        // Seed master data (Phase 1)
        $this->call(UnitOfMeasureSeeder::class);
        $this->call(TaxCodeSeeder::class);
        $this->call(ChargeSeeder::class);
        $this->call(ChargeRuleSeeder::class);
        $this->call(ItemSeeder::class);
        $this->call(SupplierSeeder::class);
        $this->call(CostComponentSeeder::class);
        $this->call(PriceListSeeder::class);

        // Seed locations and container types
        $this->call(LocationSeeder::class);
        $this->call(ContainerTypeSeeder::class);

        // Seed shipments
        $this->call(ShipmentSeeder::class);

        // Seed customers and orders
        $this->call(CustomerSeeder::class);
        $this->call(OrderSeeder::class);

        // Seed margin rules (Margin Engine)
        $this->call(MarginRuleSeeder::class);

        // Seed pricing and rate cards
        $this->call(PaymentTermSeeder::class);
        $this->call(RateCardSeeder::class);

        // Seed quotations with all related data
        $this->call(QuotationSeeder::class);

        // Seed invoices
        $this->call(InvoiceSeeder::class);
    }
}
