<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->decimal('base_price', 12, 2);
            $table->integer('min_qty')->default(0);
            $table->integer('max_qty')->nullable();
            $table->string('customer_group')->nullable();
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->string('contract_reference')->nullable();
            $table->string('currency')->default('USD');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('item_id');
            $table->index('valid_from');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_lists');
    }
};
