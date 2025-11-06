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
        Schema::create('forwarding_prices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('origin_country');
            $table->string('destination_country');
            $table->string('service_type'); // Standard, Express, Economy
            $table->decimal('base_price', 12, 2);
            $table->decimal('per_kg_price', 12, 2);
            $table->decimal('per_cbm_price', 12, 2);
            $table->decimal('handling_fee', 12, 2)->default(0);
            $table->integer('transit_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['origin_country', 'destination_country']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forwarding_prices');
    }
};
