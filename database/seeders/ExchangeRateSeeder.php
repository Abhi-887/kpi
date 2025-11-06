<?php

namespace Database\Seeders;

use App\Models\ExchangeRate;
use Illuminate\Database\Seeder;

class ExchangeRateSeeder extends Seeder
{
    public function run(): void
    {
        // Create 30 exchange rate records
        ExchangeRate::factory(30)->create();

        // Add some specific common rates
        $commonRates = [
            ['INR', 'USD', 83.50],
            ['USD', 'EUR', 0.92],
            ['EUR', 'GBP', 0.86],
            ['USD', 'GBP', 0.79],
            ['INR', 'EUR', 76.80],
            ['INR', 'GBP', 65.80],
        ];

        foreach ($commonRates as [$from, $to, $rate]) {
            ExchangeRate::create([
                'from_currency' => $from,
                'to_currency' => $to,
                'rate' => $rate,
                'inverse_rate' => 1 / $rate,
                'effective_date' => today(),
                'status' => 'active',
                'source' => 'manual',
            ]);
        }
    }
}
