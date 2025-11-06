<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExchangeRate>
 */
class ExchangeRateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $currencies = ['INR', 'USD', 'GBP', 'EUR', 'JPY', 'SGD', 'AUD', 'CAD', 'DEM'];
        $from = $this->faker->randomElement($currencies);
        $to = $this->faker->randomElement(array_diff($currencies, [$from]));

        $rate = $this->faker->numberBetween(50, 15000) / 100;

        return [
            'from_currency' => $from,
            'to_currency' => $to,
            'rate' => $rate,
            'inverse_rate' => 1 / $rate,
            'effective_date' => $this->faker->dateTime(),
            'expiry_date' => $this->faker->boolean(50) ? $this->faker->dateTime() : null,
            'source' => $this->faker->randomElement(['manual', 'api']),
            'status' => $this->faker->randomElement(['active', 'inactive']),
        ];
    }
}
