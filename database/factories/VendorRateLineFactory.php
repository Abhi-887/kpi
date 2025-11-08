<?php

namespace Database\Factories;

use App\Models\Charge;
use App\Models\UnitOfMeasure;
use App\Models\VendorRateHeader;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VendorRateLine>
 */
class VendorRateLineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $slabMin = $this->faker->numberBetween(0, 100);
        $slabMax = $this->faker->numberBetween($slabMin + 1, $slabMin + 500);

        return [
            'rate_header_id' => VendorRateHeader::factory(),
            'charge_id' => Charge::factory(),
            'uom_id' => UnitOfMeasure::factory(),
            'currency_code' => $this->faker->randomElement(['USD', 'EUR', 'GBP', 'INR', 'AUD']),
            'slab_min' => $slabMin,
            'slab_max' => $slabMax,
            'cost_rate' => $this->faker->randomFloat(2, 10, 500),
            'is_fixed_rate' => $this->faker->boolean(),
            'sequence' => 0,
            'is_active' => true,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
