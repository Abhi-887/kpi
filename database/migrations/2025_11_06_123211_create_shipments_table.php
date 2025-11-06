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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();

            // Basic Shipment Info
            $table->string('tracking_number')->unique();
            $table->string('reference_number')->nullable();
            $table->enum('status', ['pending', 'in_transit', 'delivered', 'returned', 'cancelled'])->default('pending');

            // Origin & Destination
            $table->string('origin_city');
            $table->string('origin_country');
            $table->string('destination_city');
            $table->string('destination_country');

            // Shipment Details
            $table->decimal('weight', 10, 2); // in kg
            $table->decimal('length', 10, 2)->nullable(); // in cm
            $table->decimal('width', 10, 2)->nullable(); // in cm
            $table->decimal('height', 10, 2)->nullable(); // in cm
            $table->string('item_description');
            $table->integer('item_quantity')->default(1);
            $table->decimal('declared_value', 12, 2)->nullable();

            // Service Type
            $table->enum('service_type', ['standard', 'express', 'overnight', 'economy'])->default('standard');
            $table->string('carrier')->nullable();

            // Dates
            $table->date('pickup_date')->nullable();
            $table->date('expected_delivery_date')->nullable();
            $table->date('actual_delivery_date')->nullable();

            // Pricing
            $table->decimal('base_freight', 12, 2)->nullable();
            $table->decimal('handling_charge', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total_cost', 12, 2)->nullable();

            // Metadata
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index('tracking_number');
            $table->index('status');
            $table->index('origin_city');
            $table->index('destination_city');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
