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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('email_shipment_created')->default(true);
            $table->boolean('email_shipment_updates')->default(true);
            $table->boolean('email_delivery')->default(true);
            $table->boolean('email_order_updates')->default(true);
            $table->boolean('email_payment_updates')->default(true);
            $table->boolean('sms_shipment_created')->default(false);
            $table->boolean('sms_shipment_updates')->default(false);
            $table->boolean('sms_delivery')->default(false);
            $table->boolean('in_app_all')->default(true);
            $table->string('notification_frequency')->default('immediate'); // immediate, daily, weekly
            $table->boolean('digest_enabled')->default(false);
            $table->timestamps();
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
