<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->unique()->index();
            $table->enum('customer_type', ['individual', 'business', 'corporate'])->default('business')->index();
            $table->string('email')->unique()->index();
            $table->string('phone');
            $table->string('secondary_phone')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('tax_id')->nullable();
            $table->foreignId('payment_term_id')->nullable()->nullOnDelete()->constrained();
            $table->decimal('credit_limit', 12, 2)->default(0);
            $table->decimal('used_credit', 12, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->index();
            $table->timestamp('last_order_date')->nullable();
            $table->integer('total_orders')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
