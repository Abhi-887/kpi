<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Currency>
 */
class CurrencyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $currencies = [
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$'],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€'],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£'],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'symbol' => '¥'],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'A$'],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => 'C$'],
            ['code' => 'CHF', 'name' => 'Swiss Franc', 'symbol' => 'CHF'],
            ['code' => 'CNY', 'name' => 'Chinese Yuan', 'symbol' => '¥'],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'symbol' => 'S$'],
            ['code' => 'AED', 'name' => 'UAE Dirham', 'symbol' => 'د.إ'],
        ];

        $currency = $this->faker->randomElement($currencies);

        return [
            'currency_code' => $this->faker->unique()->regexify('[A-Z]{3}'),
            'currency_name' => $currency['name'],
            'symbol' => $currency['symbol'],
            'decimal_places' => 2,
            'is_base_currency' => false,
            'is_active' => true,
            'description' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Configure as INR (Indian Rupee).
     */
    public function inr(): static
    {
        return $this->state(fn () => [
            'currency_code' => 'INR',
            'currency_name' => 'Indian Rupee',
            'symbol' => '₹',
            'is_base_currency' => true,
        ]);
    }

    /**
     * Configure as USD (US Dollar).
     */
    public function usd(): static
    {
        return $this->state(fn () => [
            'currency_code' => 'USD',
            'currency_name' => 'US Dollar',
            'symbol' => '$',
        ]);
    }

    /**
     * Configure as base currency.
     */
    public function baseCurrency(): static
    {
        return $this->state(fn () => [
            'is_base_currency' => true,
        ]);
    }

    /**
     * Configure as inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
