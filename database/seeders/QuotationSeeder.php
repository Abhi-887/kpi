<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Location;
use App\Models\QuotationDimension;
use App\Models\QuotationHeader;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuotationSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::limit(20)->get();
        $users = User::limit(5)->get();
        $locations = Location::all();

        if ($locations->isEmpty() || $customers->isEmpty() || $users->isEmpty()) {
            return;
        }

        $modes = ['AIR', 'SEA', 'ROAD', 'RAIL'];
        $movements = ['IMPORT', 'EXPORT', 'DOMESTIC'];
        $terms = ['FOB', 'CIF', 'EXW', 'DDP'];
        $statuses = ['draft', 'pending_costing', 'pending_approval', 'sent', 'won', 'lost', 'cancelled'];

        $quoteCounter = 1;

        foreach ($customers as $customer) {
            // Create 2-4 quotations per customer
            for ($i = 0; $i < rand(2, 4); $i++) {
                $mode = $modes[array_rand($modes)];
                $salesperson = $users->random();
                $createdBy = $users->random();

                $quotation = QuotationHeader::create([
                    'quote_id' => 'Q-'.date('Ymd').'-'.str_pad($quoteCounter++, 4, '0', STR_PAD_LEFT),
                    'customer_id' => $customer->id,
                    'mode' => $mode,
                    'movement' => $movements[array_rand($movements)],
                    'terms' => $terms[array_rand($terms)],
                    'origin_port_id' => $locations->random()->id,
                    'destination_port_id' => $locations->random()->id,
                    'origin_location_id' => rand(0, 1) ? $locations->random()->id : null,
                    'destination_location_id' => rand(0, 1) ? $locations->random()->id : null,
                    'salesperson_user_id' => $salesperson->id,
                    'created_by_user_id' => $createdBy->id,
                    'quote_status' => $statuses[array_rand($statuses)],
                    'notes' => fake()->sentence(),
                    'total_chargeable_weight' => fake()->randomFloat(2, 100, 10000),
                    'total_cbm' => fake()->randomFloat(4, 1, 100),
                    'total_pieces' => fake()->numberBetween(1, 500),
                ]);

                // Add dimensions
                for ($j = 0; $j < rand(1, 5); $j++) {
                    $length = fake()->randomFloat(2, 10, 300);
                    $width = fake()->randomFloat(2, 10, 300);
                    $height = fake()->randomFloat(2, 10, 300);
                    $pieces = fake()->numberBetween(1, 100);
                    $weightPerPiece = fake()->randomFloat(2, 0.5, 500);

                    $totalActualWeight = $pieces * $weightPerPiece;
                    $volumeCbm = (($length * $width * $height) / 1_000_000) * $pieces;
                    $volumetricWeight = $volumeCbm * 166.67;

                    QuotationDimension::create([
                        'quotation_header_id' => $quotation->id,
                        'length_cm' => $length,
                        'width_cm' => $width,
                        'height_cm' => $height,
                        'pieces' => $pieces,
                        'actual_weight_per_piece_kg' => $weightPerPiece,
                        'total_actual_weight_kg' => $totalActualWeight,
                        'volume_cbm' => $volumeCbm,
                        'volumetric_weight_kg' => $volumetricWeight,
                    ]);
                }
            }
        }
    }
}
