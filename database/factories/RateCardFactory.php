<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RateCard>
 */
class RateCardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $countries = ['India', 'USA', 'UK', 'Japan', 'Singapore', 'Australia', 'Canada', 'Germany', 'France', 'Dubai'];
        $serviceTypes = ['standard', 'express', 'overnight', 'economy'];

        $origin = $this->faker->randomElement($countries);
        $destination = $this->faker->randomElement(array_diff($countries, [$origin]));
        $timestamp = now()->timestamp;
        $name = "Rate - {$origin} to {$destination} ({$timestamp})";

        return [
            'name' => $name,
            'slug' => str($name)->slug(),
            'description' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'service_type' => $this->faker->randomElement($serviceTypes),
            'origin_country' => $origin,
            'destination_country' => $destination,
            'base_rate' => $this->faker->numberBetween(500, 5000) / 100,
            'minimum_charge' => $this->faker->numberBetween(100, 500) / 100,
            'surcharge_percentage' => $this->faker->numberBetween(0, 1500) / 100,
            'rules' => [
                'min_weight' => $this->faker->numberBetween(0, 10),
                'max_weight' => $this->faker->numberBetween(100, 500),
            ],
            'is_zone_based' => $this->faker->boolean(30),
            'valid_days' => $this->faker->randomElement([30, 60, 90, 365]),
        ];
    }
}
