<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supplier_id' => $this->faker->unique()->bothify('SUP-####'),
            'name' => $this->faker->company(),
            'contact_person' => $this->faker->name(),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'company' => $this->faker->company(),
            'gst_vat_number' => $this->faker->bothify('##-##-##-###'),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'country' => $this->faker->country(),
            'zip_code' => $this->faker->postcode(),
            'payment_terms' => $this->faker->randomElement(['NET30', 'NET60', 'NET90']),
            'lead_time_days' => $this->faker->numberBetween(1, 30),
            'preferred_currency' => $this->faker->randomElement(['USD', 'EUR', 'GBP', 'INR']),
            'rating_score' => $this->faker->randomFloat(1, 1, 5),
            'is_active' => true,
        ];
    }
}
