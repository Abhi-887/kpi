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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('order_number')->unique()->index();
            $table->enum('order_type', ['standard', 'express', 'ltl', 'fcl', 'lcl'])->default('standard');
            $table->enum('status', ['draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])->default('draft')->index();
            $table->dateTime('order_date')->index();
            $table->dateTime('required_delivery_date')->nullable();
            $table->dateTime('actual_delivery_date')->nullable();
            $table->string('origin_country', 2)->nullable();
            $table->string('destination_country', 2)->nullable();
            $table->decimal('total_weight', 12, 2)->nullable();
            $table->enum('weight_unit', ['kg', 'lbs', 'tons'])->default('kg');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('special_instructions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
