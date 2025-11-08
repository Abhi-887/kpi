<?php

namespace Database\Seeders;

use App\Models\PaymentTerm;
use Illuminate\Database\Seeder;

class PaymentTermSeeder extends Seeder
{
    public function run(): void
    {
        $terms = [
            ['name' => 'Net 30', 'code' => 'NET30', 'type' => 'net', 'days_to_pay' => 30, 'description' => 'Payment due within 30 days'],
            ['name' => 'Net 60', 'code' => 'NET60', 'type' => 'net', 'days_to_pay' => 60, 'description' => 'Payment due within 60 days'],
            ['name' => 'Net 90', 'code' => 'NET90', 'type' => 'net', 'days_to_pay' => 90, 'description' => 'Payment due within 90 days'],
            ['name' => 'Due on Receipt', 'code' => 'DOR', 'type' => 'net', 'days_to_pay' => 0, 'description' => 'Payment due immediately'],
            ['name' => 'Advance Payment', 'code' => 'PREPAID', 'type' => 'prepaid', 'days_to_pay' => -1, 'description' => 'Payment due before shipment'],
            ['name' => '2/10 Net 30', 'code' => '2_10_NET_30', 'type' => 'net', 'days_to_pay' => 30, 'discount_percentage' => 2, 'discount_days' => 10, 'description' => '2% discount if paid within 10 days'],
            ['name' => 'Cash on Delivery', 'code' => 'COD', 'type' => 'cod', 'days_to_pay' => 0, 'description' => 'Payment upon delivery'],
        ];

        foreach ($terms as $term) {
            PaymentTerm::firstOrCreate(['code' => $term['code']], $term);
        }
    }
}
