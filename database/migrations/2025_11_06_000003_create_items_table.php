<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category');
            $table->foreignId('unit_of_measure_id')->constrained('unit_of_measures');
            $table->decimal('default_cost', 12, 2);
            $table->decimal('default_price', 12, 2);
            $table->decimal('weight', 10, 4)->nullable();
            $table->decimal('length', 10, 4)->nullable();
            $table->decimal('width', 10, 4)->nullable();
            $table->decimal('height', 10, 4)->nullable();
            $table->string('hsn_sac')->nullable();
            $table->boolean('active_flag')->default(true);
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->index('item_code');
            $table->index('sku');
            $table->index('category');
            $table->index('active_flag');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
