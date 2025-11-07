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
        Schema::create('vendor_rate_headers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('suppliers')->comment('FK to Vendor/Supplier Master');
            $table->enum('mode', ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL'])->comment('Transportation mode');
            $table->enum('movement', ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL'])->comment('Type of movement');
            $table->foreignId('origin_port_id')->constrained('locations')->comment('Origin port/location');
            $table->foreignId('destination_port_id')->constrained('locations')->comment('Destination port/location');
            $table->enum('terms', ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'])->comment('Incoterms');
            $table->date('valid_from')->comment('Rate validity start date');
            $table->date('valid_upto')->comment('Rate validity end date');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['vendor_id', 'mode', 'movement']);
            $table->index(['origin_port_id', 'destination_port_id']);
            $table->index('valid_upto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_rate_headers');
    }
};
