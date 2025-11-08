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
        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->string('charge_id')->unique();
            $table->string('charge_code')->unique();
            $table->string('charge_name');
            $table->foreignId('default_uom_id')->constrained('unit_of_measures')->onDelete('restrict');
            $table->foreignId('default_tax_id')->constrained('tax_codes')->onDelete('restrict');
            $table->decimal('default_fixed_rate_inr', 12, 2)->nullable();
            $table->string('charge_type');
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
        Schema::dropIfExists('charges');
    }
};
