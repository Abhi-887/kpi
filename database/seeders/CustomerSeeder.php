<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\PaymentTerm;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // Create payment terms first with specific values (if they don't exist)
        PaymentTerm::firstOrCreate(
            ['code' => 'NET30'],
            [
                'name' => 'Net 30',
                'description' => 'Payment due in 30 days',
                'type' => 'net',
                'days_to_pay' => 30,
                'discount_percentage' => 0,
                'discount_days' => 0,
                'is_active' => true,
            ]
        );

        PaymentTerm::firstOrCreate(
            ['code' => 'NET60'],
            [
                'name' => 'Net 60',
                'description' => 'Payment due in 60 days',
                'type' => 'net',
                'days_to_pay' => 60,
                'discount_percentage' => 2.5,
                'discount_days' => 10,
                'is_active' => true,
            ]
        );

        PaymentTerm::firstOrCreate(
            ['code' => 'COD'],
            [
                'name' => 'Cash on Delivery',
                'description' => 'Payment upon delivery',
                'type' => 'cod',
                'days_to_pay' => 0,
                'discount_percentage' => 0,
                'discount_days' => 0,
                'is_active' => true,
            ]
        );

        PaymentTerm::firstOrCreate(
            ['code' => 'PREPAID'],
            [
                'name' => 'Prepaid',
                'description' => 'Full payment in advance',
                'type' => 'prepaid',
                'days_to_pay' => 0,
                'discount_percentage' => 5,
                'discount_days' => 0,
                'is_active' => true,
            ]
        );

        PaymentTerm::firstOrCreate(
            ['code' => 'PARTIAL'],
            [
                'name' => 'Partial',
                'description' => '50% upfront, 50% on delivery',
                'type' => 'partial',
                'days_to_pay' => 0,
                'discount_percentage' => 0,
                'discount_days' => 0,
                'is_active' => true,
            ]
        );

        // Create 50 customers with addresses
        Customer::factory(50)
            ->has(
                CustomerAddress::factory(2)->state(fn (array $attributes) => [
                    'is_primary' => false,
                ]),
                'addresses'
            )
            ->create();

        // Create 20 more active customers with addresses
        Customer::factory(20)
            ->has(
                CustomerAddress::factory(3)->state(fn (array $attributes) => [
                    'is_primary' => false,
                ]),
                'addresses'
            )
            ->create([
                'status' => 'active',
            ]);
    }
}
