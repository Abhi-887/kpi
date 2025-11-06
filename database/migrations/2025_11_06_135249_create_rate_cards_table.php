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
        Schema::create('rate_cards', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique()->index();
            $table->string('slug')->unique()->index();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->enum('service_type', ['standard', 'express', 'overnight', 'economy'])->index();
            $table->string('origin_country')->index();
            $table->string('destination_country')->index();
            $table->decimal('base_rate', 10, 2)->comment('Base rate per kg');
            $table->decimal('minimum_charge', 10, 2)->default(0)->comment('Minimum charge per shipment');
            $table->decimal('surcharge_percentage', 5, 2)->default(0)->comment('Surcharge percentage on base rate');
            $table->json('rules')->nullable()->comment('Additional pricing rules');
            $table->boolean('is_zone_based')->default(false);
            $table->integer('valid_days')->default(365)->comment('Rate validity in days');
            $table->foreignId('role_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rate_cards');
    }
};
