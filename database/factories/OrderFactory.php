<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 100, 50000);
        $tax = $subtotal * 0.1;
        $shippingCost = $this->faker->randomFloat(2, 50, 2000);
        $totalAmount = $subtotal + $tax + $shippingCost;

        return [
            'customer_id' => Customer::query()->inRandomOrder()->first()?->id ?? Customer::factory(),
            'order_number' => 'ORD-' . strtoupper($this->faker->unique()->bothify('??##????')),
            'order_type' => $this->faker->randomElement(['standard', 'express', 'ltl', 'fcl', 'lcl']),
            'status' => $this->faker->randomElement(['draft', 'pending', 'confirmed', 'shipped', 'delivered']),
            'order_date' => $this->faker->dateTimeBetween('-6 months'),
            'required_delivery_date' => $this->faker->dateTimeBetween('+5 days', '+30 days'),
            'actual_delivery_date' => null,
            'origin_country' => $this->faker->countryCode(),
            'destination_country' => $this->faker->countryCode(),
            'total_weight' => $this->faker->randomFloat(2, 10, 5000),
            'weight_unit' => $this->faker->randomElement(['kg', 'lbs', 'tons']),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping_cost' => $shippingCost,
            'total_amount' => $totalAmount,
            'notes' => $this->faker->optional()->sentence(),
            'special_instructions' => $this->faker->optional()->sentence(),
        ];
    }
}
