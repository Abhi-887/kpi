<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_of_measures', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('symbol');
            $table->foreignId('base_uom')->nullable()->constrained('unit_of_measures');
            $table->decimal('conversion_factor', 10, 4)->default(1);
            $table->enum('category', ['Weight', 'Length', 'Volume', 'Count']);
            $table->timestamps();

            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_of_measures');
    }
};
