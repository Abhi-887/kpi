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
        Schema::create('quotation_sale_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('quotation_header_id');
            $table->unsignedBigInteger('charge_id');

            // Display name on PDF/Invoice
            $table->string('display_name'); // e.g., "Air Freight Charges"

            // Quantity and Rate
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_sale_rate', 12, 2);
            $table->string('sale_currency', 3)->default('INR');

            // Totals (pre-tax)
            $table->decimal('total_sale_price_inr', 12, 2);

            // Tax
            $table->decimal('tax_rate', 5, 2)->default(0); // e.g., 18 for 18% GST
            $table->decimal('tax_amount_inr', 12, 2)->default(0);

            // Final with tax
            $table->decimal('line_total_with_tax_inr', 12, 2);

            // Markup calculation
            $table->decimal('internal_cost_inr', 12, 2)->nullable(); // From cost line
            $table->decimal('margin_percentage', 5, 2)->nullable(); // ((sale_price - cost) / cost) * 100

            $table->timestamps();

            $table->index('quotation_header_id');
            $table->index('charge_id');
        });

        // Add foreign keys
        if (Schema::hasTable('quotation_headers') && Schema::hasTable('charges')) {
            Schema::table('quotation_sale_lines', function (Blueprint $table) {
                $table->foreign('quotation_header_id')->references('id')->on('quotation_headers')->cascadeOnDelete();
                $table->foreign('charge_id')->references('id')->on('charges')->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_sale_lines');
    }
};
