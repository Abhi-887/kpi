<?php

namespace Database\Factories;

use App\Enums\ChargeType;
use App\Models\TaxCode;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Charge>
 */
class ChargeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'charge_id' => 'CHG-'.$this->faker->numerify('###'),
            'charge_code' => $this->faker->unique()->bothify('????'),
            'charge_name' => $this->faker->words(3, true),
            'default_uom_id' => UnitOfMeasure::factory(),
            'default_tax_id' => TaxCode::factory(),
            'default_fixed_rate_inr' => $this->faker->randomFloat(2, 1000, 50000),
            'charge_type' => $this->faker->randomElement(ChargeType::cases()),
            'is_active' => true,
            'description' => $this->faker->optional()->sentence(),
        ];
    }

    public function fixed(): static
    {
        return $this->state(fn () => [
            'charge_type' => ChargeType::Fixed,
        ]);
    }

    public function variable(): static
    {
        return $this->state(fn () => [
            'charge_type' => ChargeType::Variable,
            'default_fixed_rate_inr' => null,
        ]);
    }

    public function weightBased(): static
    {
        return $this->state(fn () => [
            'charge_type' => ChargeType::WeightBased,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
