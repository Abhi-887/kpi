<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            [
                'currency_code' => 'INR',
                'currency_name' => 'Indian Rupee',
                'symbol' => '₹',
                'decimal_places' => 2,
                'is_base_currency' => true,
                'is_active' => true,
                'description' => 'Official currency of India',
            ],
            [
                'currency_code' => 'USD',
                'currency_name' => 'US Dollar',
                'symbol' => '$',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of the United States',
            ],
            [
                'currency_code' => 'EUR',
                'currency_name' => 'Euro',
                'symbol' => '€',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of the Eurozone',
            ],
            [
                'currency_code' => 'GBP',
                'currency_name' => 'British Pound Sterling',
                'symbol' => '£',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of the United Kingdom',
            ],
            [
                'currency_code' => 'JPY',
                'currency_name' => 'Japanese Yen',
                'symbol' => '¥',
                'decimal_places' => 0,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of Japan',
            ],
            [
                'currency_code' => 'AED',
                'currency_name' => 'UAE Dirham',
                'symbol' => 'د.إ',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of the United Arab Emirates',
            ],
            [
                'currency_code' => 'SGD',
                'currency_name' => 'Singapore Dollar',
                'symbol' => 'S$',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of Singapore',
            ],
            [
                'currency_code' => 'CNY',
                'currency_name' => 'Chinese Yuan',
                'symbol' => '¥',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of China',
            ],
            [
                'currency_code' => 'AUD',
                'currency_name' => 'Australian Dollar',
                'symbol' => 'A$',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of Australia',
            ],
            [
                'currency_code' => 'CAD',
                'currency_name' => 'Canadian Dollar',
                'symbol' => 'C$',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of Canada',
            ],
            [
                'currency_code' => 'CHF',
                'currency_name' => 'Swiss Franc',
                'symbol' => 'CHF',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of Switzerland',
            ],
            [
                'currency_code' => 'SAR',
                'currency_name' => 'Saudi Riyal',
                'symbol' => '﷼',
                'decimal_places' => 2,
                'is_base_currency' => false,
                'is_active' => true,
                'description' => 'Official currency of Saudi Arabia',
            ],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(
                ['currency_code' => $currency['currency_code']],
                $currency
            );
        }
    }
}
