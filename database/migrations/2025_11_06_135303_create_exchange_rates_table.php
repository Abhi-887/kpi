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
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('from_currency', 3)->index();
            $table->string('to_currency', 3)->index();
            $table->decimal('rate', 10, 6);
            $table->decimal('inverse_rate', 10, 6)->comment('1 to_currency = inverse_rate from_currency');
            $table->date('effective_date')->index();
            $table->date('expiry_date')->nullable();
            $table->string('source')->default('manual')->comment('Source of exchange rate: manual, api, etc');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->unique(['from_currency', 'to_currency', 'effective_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
