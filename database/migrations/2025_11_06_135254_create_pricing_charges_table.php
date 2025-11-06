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
        Schema::create('pricing_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rate_card_id')->constrained()->cascadeOnDelete();
            $table->string('name')->index();
            $table->enum('charge_type', ['fixed', 'percentage', 'weight_based'])->index();
            $table->decimal('amount', 10, 2);
            $table->string('description')->nullable();
            $table->boolean('is_optional')->default(false);
            $table->integer('apply_order')->default(1)->comment('Order of charge application');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_charges');
    }
};
