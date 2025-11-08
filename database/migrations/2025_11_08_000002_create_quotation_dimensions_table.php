<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quotation_dimensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_header_id')->constrained('quotation_headers')->cascadeOnDelete();

            // Dimensions in centimeters
            $table->decimal('length_cm', 10, 2);
            $table->decimal('width_cm', 10, 2);
            $table->decimal('height_cm', 10, 2);

            // Weight and Pieces
            $table->integer('pieces');
            $table->decimal('actual_weight_per_piece_kg', 10, 2);

            // Calculated fields
            $table->decimal('total_actual_weight_kg', 12, 2); // pieces * weight_per_piece
            $table->decimal('volume_cbm', 12, 4); // (L*W*H)/1,000,000 * pieces
            $table->decimal('volumetric_weight_kg', 12, 2); // (volume_cbm * 166.67) - only for AIR

            $table->timestamps();

            $table->index('quotation_header_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_dimensions');
    }
};
