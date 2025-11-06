<?php

namespace Database\Seeders;

use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;

class UnitOfMeasureSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Kilogram', 'symbol' => 'kg', 'category' => 'Weight', 'conversion_factor' => 1],
            ['name' => 'Gram', 'symbol' => 'g', 'category' => 'Weight', 'conversion_factor' => 0.001],
            ['name' => 'Ton', 'symbol' => 'T', 'category' => 'Weight', 'conversion_factor' => 1000],
            ['name' => 'Pound', 'symbol' => 'lb', 'category' => 'Weight', 'conversion_factor' => 0.453592],
            
            ['name' => 'Meter', 'symbol' => 'm', 'category' => 'Length', 'conversion_factor' => 1],
            ['name' => 'Centimeter', 'symbol' => 'cm', 'category' => 'Length', 'conversion_factor' => 0.01],
            ['name' => 'Millimeter', 'symbol' => 'mm', 'category' => 'Length', 'conversion_factor' => 0.001],
            ['name' => 'Kilometer', 'symbol' => 'km', 'category' => 'Length', 'conversion_factor' => 1000],
            ['name' => 'Inch', 'symbol' => 'in', 'category' => 'Length', 'conversion_factor' => 0.0254],
            
            ['name' => 'Liter', 'symbol' => 'L', 'category' => 'Volume', 'conversion_factor' => 1],
            ['name' => 'Milliliter', 'symbol' => 'mL', 'category' => 'Volume', 'conversion_factor' => 0.001],
            ['name' => 'Cubic Meter', 'symbol' => 'm3', 'category' => 'Volume', 'conversion_factor' => 1000],
            ['name' => 'Gallon', 'symbol' => 'gal', 'category' => 'Volume', 'conversion_factor' => 3.78541],
            
            ['name' => 'Piece', 'symbol' => 'pcs', 'category' => 'Count', 'conversion_factor' => 1],
            ['name' => 'Box', 'symbol' => 'box', 'category' => 'Count', 'conversion_factor' => 1],
            ['name' => 'Case', 'symbol' => 'case', 'category' => 'Count', 'conversion_factor' => 1],
            ['name' => 'Dozen', 'symbol' => 'doz', 'category' => 'Count', 'conversion_factor' => 12],
        ];

        foreach ($units as $unit) {
            UnitOfMeasure::create($unit);
        }
    }
}
