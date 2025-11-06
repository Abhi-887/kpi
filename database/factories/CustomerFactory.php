<?php

namespace Database\Factories;

use App\Models\PaymentTerm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $paymentTermIds = PaymentTerm::pluck('id')->toArray();

        return [
            'company_name' => $this->faker->unique()->company(),
            'customer_type' => $this->faker->randomElement(['individual', 'business', 'corporate']),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'secondary_phone' => $this->faker->optional()->phoneNumber(),
            'registration_number' => $this->faker->optional()->numerify('REG#########'),
            'tax_id' => $this->faker->optional()->numerify('TAX#########'),
            'payment_term_id' => $paymentTermIds ? $this->faker->randomElement($paymentTermIds) : null,
            'credit_limit' => $this->faker->randomElement([5000, 10000, 15000, 20000, 30000, 50000]),
            'used_credit' => 0,
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'last_order_date' => $this->faker->optional()->dateTimeBetween('-30 days'),
            'total_orders' => $this->faker->numberBetween(0, 50),
        ];
    }
}
