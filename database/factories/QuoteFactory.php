<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quote>
 */
class QuoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rateCard = \App\Models\RateCard::inRandomOrder()->first() ?? \App\Models\RateCard::factory()->create();
        $weight = $this->faker->numberBetween(5, 500);
        $baseCost = $weight * (float) $rateCard->base_rate;
        $baseCost = max($baseCost, (float) $rateCard->minimum_charge);
        $surcharge = $baseCost * ((float) $rateCard->surcharge_percentage / 100);
        $totalCost = $baseCost + $surcharge;
        $currencyRate = \App\Models\ExchangeRate::inRandomOrder()->first()?->rate ?? 1.0;

        return [
            'reference_number' => 'QT-'.now()->format('Ymd').'-'.str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
            'shipment_id' => null,
            'rate_card_id' => $rateCard->id,
            'origin_country' => $rateCard->origin_country,
            'destination_country' => $rateCard->destination_country,
            'service_type' => $rateCard->service_type,
            'weight' => $weight,
            'weight_unit' => 'kg',
            'base_cost' => $baseCost,
            'charges_total' => 0,
            'surcharge' => $surcharge,
            'total_cost' => $totalCost,
            'currency_rate' => $currencyRate,
            'currency' => 'INR',
            'total_in_currency' => $totalCost * $currencyRate,
            'status' => $this->faker->randomElement(['draft', 'sent', 'accepted', 'rejected']),
            'valid_until' => now()->addDays($this->faker->numberBetween(7, 30)),
            'notes' => $this->faker->optional()->text(200),
            'created_by' => \App\Models\User::inRandomOrder()->first()?->id ?? \App\Models\User::factory()->create()->id,
        ];
    }
}
