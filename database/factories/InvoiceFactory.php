<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(500, 50000);
        $taxRate = fake()->randomElement([0, 5, 8, 10, 12, 15]);
        $taxAmount = $subtotal * $taxRate / 100;
        $discountAmount = fake()->numberBetween(0, $subtotal * 0.1);
        $shippingCost = fake()->numberBetween(0, 5000);
        $totalAmount = $subtotal + $taxAmount - $discountAmount + $shippingCost;

        return [
            'customer_id' => fake()->numberBetween(1, 71),
            'order_id' => null,
            'invoice_number' => 'INV-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 10)),
            'status' => fake()->randomElement(['draft', 'issued', 'sent', 'viewed', 'partially_paid', 'paid']),
            'currency' => fake()->randomElement(['USD', 'EUR', 'GBP', 'CAD']),
            'invoice_date' => fake()->dateTimeBetween('-3 months'),
            'due_date' => fake()->dateTimeBetween('-1 months', '+3 months'),
            'paid_date' => fake()->optional(0.7)->dateTime(),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'tax_rate' => $taxRate,
            'discount_amount' => $discountAmount,
            'shipping_cost' => $shippingCost,
            'total_amount' => $totalAmount,
            'amount_paid' => fake()->numberBetween(0, $totalAmount),
            'po_number' => fake()->optional(0.6)->regexify('[A-Z]{2}[0-9]{6}'),
            'notes' => fake()->optional(0.5)->paragraph(),
            'payment_method' => fake()->randomElement(['bank_transfer', 'credit_card', 'check', 'wire']),
        ];
    }
}
