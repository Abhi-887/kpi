<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UnitOfMeasure>
 */
class UnitOfMeasureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'symbol' => $this->faker->bothify('??'),
            'conversion_factor' => $this->faker->randomFloat(4, 1, 100),
            'category' => $this->faker->randomElement(['Weight', 'Length', 'Volume', 'Count']),
        ];
    }
}
