<?php

namespace Database\Seeders;

use App\Models\PricingCharge;
use App\Models\RateCard;
use Illuminate\Database\Seeder;

class RateCardSeeder extends Seeder
{
    public function run(): void
    {
        // Create 50 rate cards with associated pricing charges
        RateCard::factory(50)->create()->each(function (RateCard $rateCard) {
            // Each rate card gets 2-4 pricing charges
            PricingCharge::factory(rand(2, 4))->create([
                'rate_card_id' => $rateCard->id,
            ]);
        });
    }
}
