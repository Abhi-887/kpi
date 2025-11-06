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
        Schema::create('carrier_integrations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // FedEx, UPS, DHL
            $table->enum('carrier_type', ['fedex', 'ups', 'dhl', 'usps', 'other']);
            $table->string('api_key')->encrypted();
            $table->string('api_secret')->encrypted()->nullable();
            $table->string('account_number')->encrypted()->nullable();
            $table->json('settings')->nullable(); // Additional configuration
            $table->boolean('is_active')->default(true);
            $table->boolean('is_test_mode')->default(false);
            $table->timestamp('last_tested_at')->nullable();
            $table->string('test_status')->nullable(); // success, failed
            $table->text('test_message')->nullable();
            $table->timestamps();
            $table->index('carrier_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carrier_integrations');
    }
};
