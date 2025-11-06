<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerAddress>
 */
class CustomerAddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'address_type' => $this->faker->randomElement(['billing', 'shipping', 'both']),
            'street_address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state_province' => $this->faker->stateAbbr(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->randomElement(['US', 'CA', 'MX']),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'is_primary' => false,
            'notes' => $this->faker->optional()->text(100),
        ];
    }
}
