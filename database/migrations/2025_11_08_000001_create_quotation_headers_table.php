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

            // Users - using unsignedBigInteger to avoid circular dependencies
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->unsignedBigInteger('salesperson_user_id')->nullable();

            // Customer
            $table->unsignedBigInteger('customer_id')->nullable();

            // Shipment Parameters
            $table->enum('mode', ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL']);
            $table->enum('movement', ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL']);
            $table->enum('terms', ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF']);

            // Ports/Locations - using unsignedBigInteger
            $table->unsignedBigInteger('origin_port_id')->nullable();
            $table->unsignedBigInteger('destination_port_id')->nullable();
            $table->unsignedBigInteger('origin_location_id')->nullable();
            $table->unsignedBigInteger('destination_location_id')->nullable();

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

        // Add foreign keys after all tables exist
        if (Schema::hasTable('users')) {
            Schema::table('quotation_headers', function (Blueprint $table) {
                $table->foreign('created_by_user_id')->references('id')->on('users')->nullOnDelete();
                $table->foreign('salesperson_user_id')->references('id')->on('users')->nullOnDelete();
            });
        }

        if (Schema::hasTable('customers')) {
            Schema::table('quotation_headers', function (Blueprint $table) {
                $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
            });
        }

        if (Schema::hasTable('locations')) {
            Schema::table('quotation_headers', function (Blueprint $table) {
                $table->foreign('origin_port_id')->references('id')->on('locations')->nullOnDelete();
                $table->foreign('destination_port_id')->references('id')->on('locations')->nullOnDelete();
                $table->foreign('origin_location_id')->references('id')->on('locations')->nullOnDelete();
                $table->foreign('destination_location_id')->references('id')->on('locations')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_headers');
    }
};
