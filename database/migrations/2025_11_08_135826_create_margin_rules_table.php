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
        Schema::create('margin_rules', function (Blueprint $table) {
            $table->id();
            $table->integer('precedence')->default(0)->index()->comment('Higher precedence wins in rule resolution');
            $table->foreignId('charge_id')->nullable()->constrained('charges')->cascadeOnDelete()->comment('NULL = applies to all charges');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->cascadeOnDelete()->comment('NULL = applies to all customers');
            $table->decimal('margin_percentage', 8, 4)->default(0)->comment('e.g., 0.15 for 15%');
            $table->decimal('margin_fixed_inr', 12, 2)->default(0)->comment('Fixed markup amount in INR, e.g., 500');
            $table->boolean('is_active')->default(true)->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['charge_id', 'customer_id', 'precedence', 'is_active'], 'margin_rules_resolution_idx');
            $table->unique(['charge_id', 'customer_id', 'precedence'], 'margin_rules_unique_precedence');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('margin_rules');
    }
};
