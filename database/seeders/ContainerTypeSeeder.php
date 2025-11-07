<?php

namespace Database\Seeders;

use App\Models\ContainerType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContainerTypeSeeder extends Seeder
{
    public function run(): void
    {
        $containerTypes = [
            ['container_code' => '20GP', 'description' => '20ft General Purpose', 'is_active' => true],
            ['container_code' => '20OT', 'description' => '20ft Open Top', 'is_active' => true],
            ['container_code' => '20RF', 'description' => '20ft Reefer (Refrigerated)', 'is_active' => true],
            ['container_code' => '40GP', 'description' => '40ft General Purpose', 'is_active' => true],
            ['container_code' => '40HC', 'description' => '40ft High Cube', 'is_active' => true],
            ['container_code' => '40HQ', 'description' => '40ft High Cube Pallet Wide', 'is_active' => true],
            ['container_code' => '40RF', 'description' => '40ft Reefer (Refrigerated)', 'is_active' => true],
            ['container_code' => '45HC', 'description' => '45ft High Cube', 'is_active' => true],
        ];

        foreach ($containerTypes as $type) {
            ContainerType::firstOrCreate(
                ['container_code' => $type['container_code']],
                $type
            );
        }
    }
}
