<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VendorRateHeader>
 */
class VendorRateHeaderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $validFrom = $this->faker->dateTimeBetween('-30 days', 'now');

        return [
            'vendor_id' => Supplier::factory(),
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'origin_port_id' => Location::factory(),
            'destination_port_id' => Location::factory(),
            'terms' => 'FOB',
            'valid_from' => $validFrom,
            'valid_upto' => $this->faker->dateTimeBetween($validFrom, '+60 days'),
            'is_active' => true,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
