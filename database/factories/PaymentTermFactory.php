<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentTerm>
 */
class PaymentTermFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word().' Payment',
            'code' => $this->faker->unique()->bothify('PT-###??'),
            'description' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(['net', 'cod', 'prepaid', 'partial']),
            'days_to_pay' => $this->faker->randomElement([0, 7, 14, 30, 60]),
            'discount_percentage' => $this->faker->randomElement([0, 2.5, 5, 10]),
            'discount_days' => $this->faker->randomElement([0, 7, 10, 15]),
            'is_active' => true,
        ];
    }
}
