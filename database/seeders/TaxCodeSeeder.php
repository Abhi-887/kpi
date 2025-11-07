<?php

namespace Database\Seeders;

use App\Models\TaxCode;
use Illuminate\Database\Seeder;

class TaxCodeSeeder extends Seeder
{
    public function run(): void
    {
        $taxCodes = [
            ['tax_code' => 'GST-0', 'tax_name' => '0% GST', 'rate' => 0, 'applicability' => 'Both', 'tax_type' => 'IGST', 'jurisdiction' => 'IN', 'effective_from' => now()],
            ['tax_code' => 'GST-5', 'tax_name' => '5% GST', 'rate' => 5, 'applicability' => 'Both', 'tax_type' => 'IGST', 'jurisdiction' => 'IN', 'effective_from' => now()],
            ['tax_code' => 'GST-12', 'tax_name' => '12% GST', 'rate' => 12, 'applicability' => 'Both', 'tax_type' => 'IGST', 'jurisdiction' => 'IN', 'effective_from' => now()],
            ['tax_code' => 'GST-18', 'tax_name' => '18% GST', 'rate' => 18, 'applicability' => 'Both', 'tax_type' => 'IGST', 'jurisdiction' => 'IN', 'effective_from' => now()],
            ['tax_code' => 'GST-28', 'tax_name' => '28% GST', 'rate' => 28, 'applicability' => 'Both', 'tax_type' => 'IGST', 'jurisdiction' => 'IN', 'effective_from' => now()],
        ];

        foreach ($taxCodes as $taxCode) {
            TaxCode::create($taxCode);
        }
    }
}
