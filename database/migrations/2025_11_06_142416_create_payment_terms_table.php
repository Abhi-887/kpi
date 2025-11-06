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
        Schema::create('payment_terms', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique()->index();
            $table->text('description')->nullable();
            $table->enum('type', ['net', 'cod', 'prepaid', 'partial'])->default('net');
            $table->integer('days_to_pay')->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->integer('discount_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_terms');
    }
};
