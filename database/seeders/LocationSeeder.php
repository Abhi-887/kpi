<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            ['code' => 'INMAA', 'name' => 'Mumbai Airport', 'city' => 'Mumbai', 'country' => 'India'],
            ['code' => 'INBKK', 'name' => 'Bangkok Airport', 'city' => 'Bangkok', 'country' => 'Thailand'],
            ['code' => 'INSGP', 'name' => 'Singapore Airport', 'city' => 'Singapore', 'country' => 'Singapore'],
            ['code' => 'INHKG', 'name' => 'Hong Kong Airport', 'city' => 'Hong Kong', 'country' => 'Hong Kong'],
            ['code' => 'INJFK', 'name' => 'JFK Airport', 'city' => 'New York', 'country' => 'United States'],
            ['code' => 'INLAX', 'name' => 'LAX Airport', 'city' => 'Los Angeles', 'country' => 'United States'],
            ['code' => 'INCDG', 'name' => 'Charles de Gaulle Airport', 'city' => 'Paris', 'country' => 'France'],
            ['code' => 'INFLM', 'name' => 'Frankfurt Airport', 'city' => 'Frankfurt', 'country' => 'Germany'],
            ['code' => 'INDXB', 'name' => 'Dubai Airport', 'city' => 'Dubai', 'country' => 'United Arab Emirates'],
            ['code' => 'INDEL', 'name' => 'Indira Gandhi Airport', 'city' => 'Delhi', 'country' => 'India'],
            ['code' => 'INSYD', 'name' => 'Sydney Airport', 'city' => 'Sydney', 'country' => 'Australia'],
            ['code' => 'INZNZ', 'name' => 'Auckland Airport', 'city' => 'Auckland', 'country' => 'New Zealand'],
            ['code' => 'INMAA_PORT', 'name' => 'Mumbai Port', 'city' => 'Mumbai', 'country' => 'India'],
            ['code' => 'INSGP_PORT', 'name' => 'Singapore Port', 'city' => 'Singapore', 'country' => 'Singapore'],
            ['code' => 'INHKG_PORT', 'name' => 'Hong Kong Port', 'city' => 'Hong Kong', 'country' => 'Hong Kong'],
            ['code' => 'INROT', 'name' => 'Rotterdam Port', 'city' => 'Rotterdam', 'country' => 'Netherlands'],
            ['code' => 'INABU', 'name' => 'Abu Dhabi Port', 'city' => 'Abu Dhabi', 'country' => 'United Arab Emirates'],
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }
    }
}
