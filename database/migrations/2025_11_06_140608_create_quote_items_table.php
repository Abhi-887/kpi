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
        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pricing_charge_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('charge_type', ['fixed', 'percentage', 'weight_based']);
            $table->decimal('amount', 12, 2);
            $table->boolean('is_optional')->default(false);
            $table->integer('apply_order');
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_items');
    }
};
