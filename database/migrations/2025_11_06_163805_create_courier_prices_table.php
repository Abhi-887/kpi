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
        Schema::create('courier_prices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('carrier_name'); // FedEx, UPS, DHL, etc.
            $table->string('service_type'); // Standard, Express, Overnight
            $table->decimal('base_price', 12, 2);
            $table->decimal('per_kg_price', 12, 2);
            $table->decimal('surcharge', 12, 2)->default(0);
            $table->integer('transit_days')->nullable();
            $table->string('coverage_area'); // Local, National, International
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['carrier_name', 'service_type']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_prices');
    }
};
