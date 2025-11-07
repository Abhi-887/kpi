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
        Schema::create('vendor_rate_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rate_header_id')->constrained('vendor_rate_headers')->cascadeOnDelete()->comment('FK to VendorRates_Header');
            $table->foreignId('charge_id')->constrained('charges')->comment('FK to Charge Master');
            $table->foreignId('uom_id')->constrained('unit_of_measures')->comment('FK to UOM Master');
            $table->string('currency_code', 3)->default('USD')->comment('Currency code (ISO 4217)');
            $table->decimal('slab_min', 10, 2)->comment('Minimum slab value (e.g., 0, 100, 250)');
            $table->decimal('slab_max', 10, 2)->comment('Maximum slab value (e.g., 99, 249, 500)');
            $table->decimal('cost_rate', 12, 4)->comment('The actual rate/cost');
            $table->boolean('is_fixed_rate')->default(false)->comment('TRUE if it\'s a PER BL fixed cost');
            $table->integer('sequence')->default(0)->comment('Display order');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['rate_header_id', 'charge_id', 'slab_min', 'slab_max', 'uom_id']);
            $table->index(['charge_id', 'slab_min', 'slab_max']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_rate_lines');
    }
};
