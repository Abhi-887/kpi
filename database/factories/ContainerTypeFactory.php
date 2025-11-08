<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContainerType>
 */
class ContainerTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $codes = ['20GP', '20OT', '20RF', '40GP', '40HC', '40HQ', '40RF', '45HC'];

        return [
            'container_code' => $this->faker->unique()->randomElement($codes),
            'description' => $this->faker->sentence(3),
            'is_active' => true,
        ];
    }
}
