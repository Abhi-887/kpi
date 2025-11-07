<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TaxCode>
 */
class TaxCodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tax_code' => $this->faker->unique()->bothify('TAX-??'),
            'tax_name' => $this->faker->words(2, true),
            'rate' => $this->faker->randomFloat(2, 0, 28),
            'applicability' => $this->faker->randomElement(['Sale', 'Purchase', 'Both']),
            'tax_type' => $this->faker->randomElement(['IGST', 'CGST', 'SGST', 'VAT', 'Other']),
            'jurisdiction' => $this->faker->optional()->country(),
            'effective_from' => $this->faker->date(),
            'effective_to' => $this->faker->optional()->date(),
            'is_active' => true,
        ];
    }
}
