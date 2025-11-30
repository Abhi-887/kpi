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
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('currency_code', 3)->unique(); // ISO 4217 code (USD, INR, EUR, etc.)
            $table->string('currency_name', 100);
            $table->string('symbol', 10)->nullable(); // ₹, $, €, etc.
            $table->unsignedTinyInteger('decimal_places')->default(2);
            $table->boolean('is_base_currency')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
