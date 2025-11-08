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
        Schema::create('quotation_cost_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_header_id')->constrained('quotation_headers')->cascadeOnDelete();
            $table->foreignId('charge_id')->constrained()->cascadeOnDelete();

            // All vendor costs stored as JSON for audit trail
            // e.g., {'vendor_1': 120.00, 'vendor_2': 125.00, 'vendor_3': 118.00}
            $table->json('all_vendor_costs')->nullable();

            // Selected vendor
            $table->foreignId('selected_vendor_id')->nullable()->constrained('vendors')->nullOnDelete();

            // Unit Cost
            $table->decimal('unit_cost_rate', 12, 2)->default(0);
            $table->string('unit_cost_currency', 3)->default('INR');

            // Exchange rate snapshot at time of costing
            $table->decimal('cost_exchange_rate', 10, 6)->default(1.0);

            // Final calculated cost in INR
            $table->decimal('total_cost_inr', 12, 2)->default(0);

            $table->timestamps();

            $table->index('quotation_header_id');
            $table->index('charge_id');
            $table->index('selected_vendor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_cost_lines');
    }
};
