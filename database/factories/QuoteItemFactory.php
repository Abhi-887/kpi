<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuoteItem>
 */
class QuoteItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $charge = \App\Models\PricingCharge::inRandomOrder()->first() ?? \App\Models\PricingCharge::factory()->create();

        return [
            'pricing_charge_id' => $charge->id,
            'name' => $charge->name,
            'charge_type' => $charge->charge_type,
            'amount' => $charge->amount,
            'is_optional' => $charge->is_optional,
            'apply_order' => $charge->apply_order,
            'status' => $charge->status,
        ];
    }
}
