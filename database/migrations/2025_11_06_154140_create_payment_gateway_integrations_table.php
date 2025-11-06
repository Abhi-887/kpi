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
        Schema::create('payment_gateway_integrations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Stripe, PayPal, Square
            $table->enum('gateway_type', ['stripe', 'paypal', 'square', 'razorpay', 'other']);
            $table->string('public_key')->encrypted();
            $table->string('secret_key')->encrypted();
            $table->string('merchant_id')->encrypted()->nullable();
            $table->json('settings')->nullable(); // Currency, webhook URLs, etc.
            $table->boolean('is_active')->default(true);
            $table->boolean('is_test_mode')->default(false);
            $table->timestamp('last_tested_at')->nullable();
            $table->string('test_status')->nullable(); // success, failed
            $table->text('test_message')->nullable();
            $table->decimal('balance', 15, 2)->default(0); // Account balance if available
            $table->timestamps();
            $table->index('gateway_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_integrations');
    }
};
