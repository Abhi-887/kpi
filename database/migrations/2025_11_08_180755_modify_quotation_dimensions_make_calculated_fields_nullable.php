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
        Schema::table('quotation_dimensions', function (Blueprint $table) {
            $table->decimal('total_actual_weight_kg', 12, 2)->nullable()->change();
            $table->decimal('volume_cbm', 12, 4)->nullable()->change();
            $table->decimal('volumetric_weight_kg', 12, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotation_dimensions', function (Blueprint $table) {
            $table->decimal('total_actual_weight_kg', 12, 2)->nullable(false)->change();
            $table->decimal('volume_cbm', 12, 4)->nullable(false)->change();
            $table->decimal('volumetric_weight_kg', 12, 2)->nullable(false)->change();
        });
    }
};
