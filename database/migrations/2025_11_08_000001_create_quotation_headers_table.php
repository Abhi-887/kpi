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
        Schema::create('quotation_headers', function (Blueprint $table) {
            $table->id();
            $table->string('quote_id')->unique()->index(); // e.g., Q-2025-0001
            $table->enum('quote_status', [
                'draft',
                'pending_costing',
                'pending_approval',
                'sent',
                'won',
                'lost',
                'cancelled',
            ])->default('draft')->index();

            // Users
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('salesperson_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Customer
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();

            // Shipment Parameters
            $table->enum('mode', ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL']);
            $table->enum('movement', ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL']);
            $table->enum('terms', ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF']);

            // Ports/Locations
            $table->foreignId('origin_port_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('destination_port_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('origin_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('destination_location_id')->nullable()->constrained('locations')->nullOnDelete();

            // Calculated Totals
            $table->decimal('total_chargeable_weight', 12, 2)->default(0);
            $table->decimal('total_cbm', 12, 4)->default(0);
            $table->integer('total_pieces')->default(0);

            // Metadata
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('customer_id');
            $table->index('created_by_user_id');
            $table->index('salesperson_user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_headers');
    }
};
