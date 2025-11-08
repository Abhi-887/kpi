<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('??#')),
            'name' => $this->faker->city(),
            'city' => $this->faker->city(),
            'country' => $this->faker->country(),
            'type' => $this->faker->randomElement(['port', 'airport', 'distribution_center', 'warehouse']),
            'description' => $this->faker->optional()->sentence(),
            'is_active' => true,
        ];
    }
}
