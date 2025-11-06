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
        Schema::create('packaging_prices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('package_type'); // Box, Envelope, Tube, Pallet
            $table->string('size_category'); // Small, Medium, Large, XL
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->decimal('max_weight', 8, 2)->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->decimal('bulk_price_5', 12, 2)->nullable();
            $table->decimal('bulk_price_10', 12, 2)->nullable();
            $table->string('material'); // Cardboard, Plastic, Wood
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['package_type', 'size_category']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packaging_prices');
    }
};
