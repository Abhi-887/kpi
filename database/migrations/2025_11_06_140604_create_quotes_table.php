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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique()->index();
            $table->foreignId('shipment_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('rate_card_id')->constrained()->cascadeOnDelete();
            $table->string('origin_country')->index();
            $table->string('destination_country')->index();
            $table->string('service_type')->index();
            $table->decimal('weight', 10, 2);
            $table->string('weight_unit')->default('kg');
            $table->decimal('base_cost', 12, 2);
            $table->decimal('charges_total', 12, 2)->default(0);
            $table->decimal('surcharge', 12, 2)->default(0);
            $table->decimal('total_cost', 12, 2);
            $table->decimal('currency_rate', 10, 6)->default(1.00);
            $table->string('currency')->default('INR');
            $table->decimal('total_in_currency', 12, 2);
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'expired'])->default('draft')->index();
            $table->dateTime('valid_until')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
