<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PricingCharge>
 */
class PricingChargeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $chargeNames = ['Fuel Surcharge', 'Handling Fee', 'Peak Season Charge', 'Remote Area Fee', 'Insurance', 'Packaging'];
        $chargeTypes = ['fixed', 'percentage', 'weight_based'];

        return [
            'name' => $this->faker->randomElement($chargeNames),
            'charge_type' => $this->faker->randomElement($chargeTypes),
            'amount' => $this->faker->numberBetween(50, 2000) / 100,
            'description' => $this->faker->sentence(),
            'is_optional' => $this->faker->boolean(20),
            'apply_order' => $this->faker->numberBetween(1, 5),
            'status' => $this->faker->randomElement(['active', 'inactive']),
        ];
    }
}
