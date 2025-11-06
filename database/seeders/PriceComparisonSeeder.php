<?php

namespace Database\Seeders;

use App\Models\ComparisonItem;
use App\Models\PriceComparison;
use App\Models\RateCard;
use App\Models\User;
use Illuminate\Database\Seeder;

class PriceComparisonSeeder extends Seeder
{
    public function run(): void
    {
        $rateCards = RateCard::all();
        $users = User::all();
        $statuses = ['favorable', 'unfavorable', 'neutral'];

        if ($rateCards->isEmpty() || $users->isEmpty()) {
            return;
        }

        for ($i = 1; $i <= 10; $i++) {
            $ourPrice = rand(10000, 100000) / 100;
            $competitorPrice = rand(10000, 100000) / 100;

            $comparison = PriceComparison::create([
                'user_id' => $users->random()->id,
                'rate_card_id' => $rateCards->random()->id,
                'login_id' => 'LOGIN_' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'our_price' => $ourPrice,
                'competitor_price' => $competitorPrice,
                'price_difference' => $ourPrice - $competitorPrice,
                'status' => $statuses[array_rand($statuses)],
                'notes' => 'Comparison note for entry ' . $i,
            ]);

            // Add comparison items
            for ($j = 1; $j <= rand(2, 5); $j++) {
                $ourRate = rand(1000, 10000) / 100;
                $competitorRate = rand(1000, 10000) / 100;

                ComparisonItem::create([
                    'price_comparison_id' => $comparison->id,
                    'service_name' => 'Service ' . $j,
                    'our_rate' => $ourRate,
                    'competitor_rate' => $competitorRate,
                    'difference' => $ourRate - $competitorRate,
                    'status' => $statuses[array_rand($statuses)],
                ]);
            }
        }
    }
}
