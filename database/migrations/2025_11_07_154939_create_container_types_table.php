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
        Schema::create('container_types', function (Blueprint $table) {
            $table->id('container_type_id');
            $table->string('container_code')->unique();
            $table->string('description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('container_code');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('container_types');
    }
};
