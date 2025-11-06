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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // NotificationType enum
            $table->string('channel'); // NotificationChannel enum
            $table->string('status')->default('pending'); // NotificationStatus enum
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->string('subject');
            $table->text('message');
            $table->json('data')->nullable();
            $table->foreignId('related_id')->nullable()->constrained('shipments')->cascadeOnDelete();
            $table->string('related_type')->nullable(); // 'Shipment', 'Order', 'Invoice'
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index('user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
