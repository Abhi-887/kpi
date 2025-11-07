<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cost_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->enum('component_type', ['Material', 'Labour', 'Overhead', 'Packaging', 'Logistics']);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('quantity_factor', 10, 4)->default(1);
            $table->string('currency')->default('USD');
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->timestamps();

            $table->index('item_id');
            $table->index('component_type');
            $table->index('effective_from');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_components');
    }
};
