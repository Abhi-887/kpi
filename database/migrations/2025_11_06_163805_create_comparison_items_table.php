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
        Schema::create('comparison_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('price_comparison_id')->constrained('price_comparisons')->cascadeOnDelete();
            $table->string('service_name');
            $table->decimal('our_rate', 12, 2);
            $table->decimal('competitor_rate', 12, 2)->nullable();
            $table->decimal('difference', 12, 2)->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['price_comparison_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comparison_items');
    }
};
