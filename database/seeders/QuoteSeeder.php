<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class QuoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 100 quotes with varying statuses
        \App\Models\Quote::factory(50)->create()->each(function ($quote) {
            // Generate reference number after quote is created
            $quote->update(['reference_number' => $quote->generateReferenceNumber()]);

            // Add 2-4 quote items per quote
            $chargeCount = rand(2, 4);
            $charges = \App\Models\PricingCharge::inRandomOrder()->limit($chargeCount)->get();

            foreach ($charges as $charge) {
                \App\Models\QuoteItem::create([
                    'quote_id' => $quote->id,
                    'pricing_charge_id' => $charge->id,
                    'name' => $charge->name,
                    'charge_type' => $charge->charge_type,
                    'amount' => $charge->amount,
                    'is_optional' => $charge->is_optional,
                    'apply_order' => $charge->apply_order,
                    'status' => $charge->status,
                ]);
            }
        });
    }
}
