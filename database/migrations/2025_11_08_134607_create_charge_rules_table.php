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
        Schema::create('charge_rules', function (Blueprint $table) {
            $table->id();
            $table->enum('mode', ['AIR', 'SEA', 'ROAD', 'RAIL', 'MULTIMODAL'])->index();
            $table->enum('movement', ['IMPORT', 'EXPORT', 'DOMESTIC', 'INTER_MODAL'])->index();
            $table->string('terms')->default('ALL_TERMS')->index()->comment('Incoterms: EXW, FCA, CPT, CIP, DAP, DDP, FOB, CFR, CIF, or ALL_TERMS for all');
            $table->foreignId('charge_id')->constrained('charges')->cascadeOnDelete();
            $table->boolean('is_active')->default(true)->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['mode', 'movement', 'terms', 'charge_id'], 'charge_rules_unique_rule');
            $table->index(['mode', 'movement', 'terms', 'is_active'], 'charge_rules_query_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charge_rules');
    }
};
