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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('Port/Location code (e.g., NYC, INBLR)');
            $table->string('name')->comment('Full name of the location');
            $table->string('city')->nullable();
            $table->string('country')->comment('Country code or full name');
            $table->enum('type', ['port', 'airport', 'distribution_center', 'warehouse', 'other'])->default('port');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('code');
            $table->index('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
