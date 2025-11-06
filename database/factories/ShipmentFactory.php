<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shipment>
 */
class ShipmentFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $baseFreight = fake()->randomFloat(2, 100, 5000);
        $handlingCharge = fake()->randomFloat(2, 10, 200);
        $tax = ($baseFreight + $handlingCharge) * 0.18; // 18% GST

        return [
            'tracking_number' => 'TRK-'.strtoupper(fake()->bothify('??##??##')).fake()->unique()->numerify('####'),
            'reference_number' => fake()->optional(0.7)->bothify('REF-########'),
            'status' => fake()->randomElement(['pending', 'in_transit', 'delivered', 'returned', 'cancelled']),
            'origin_city' => fake()->randomElement(['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Ahmedabad', 'Hyderabad', 'Chennai', 'Kolkata']),
            'origin_country' => 'India',
            'destination_city' => fake()->randomElement(['New York', 'London', 'Singapore', 'Dubai', 'Tokyo', 'Sydney', 'Toronto', 'Frankfurt']),
            'destination_country' => fake()->randomElement(['USA', 'UK', 'Singapore', 'UAE', 'Japan', 'Australia', 'Canada', 'Germany']),
            'weight' => fake()->randomFloat(2, 0.5, 100),
            'length' => fake()->optional(0.8)->randomFloat(2, 10, 200),
            'width' => fake()->optional(0.8)->randomFloat(2, 10, 200),
            'height' => fake()->optional(0.8)->randomFloat(2, 10, 200),
            'item_description' => fake()->sentence(4),
            'item_quantity' => fake()->numberBetween(1, 50),
            'declared_value' => fake()->optional(0.6)->randomFloat(2, 500, 50000),
            'service_type' => fake()->randomElement(['standard', 'express', 'overnight', 'economy']),
            'carrier' => fake()->randomElement(['DHL', 'FedEx', 'UPS', 'TNT', 'Amazon Logistics']),
            'pickup_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'expected_delivery_date' => fake()->dateTimeBetween('+5 days', '+15 days'),
            'actual_delivery_date' => fake()->optional(0.7)->dateTimeBetween('-10 days', 'now'),
            'base_freight' => $baseFreight,
            'handling_charge' => $handlingCharge,
            'tax' => $tax,
            'total_cost' => $baseFreight + $handlingCharge + $tax,
            'notes' => fake()->optional(0.5)->text(100),
            'metadata' => [
                'created_by' => 'system',
                'source' => 'api',
            ],
        ];
    }

    public function delivered(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'delivered',
                'actual_delivery_date' => fake()->dateTimeBetween('-5 days', 'now'),
            ];
        });
    }

    public function pending(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'actual_delivery_date' => null,
            ];
        });
    }

    public function inTransit(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'in_transit',
                'actual_delivery_date' => null,
            ];
        });
    }
}
