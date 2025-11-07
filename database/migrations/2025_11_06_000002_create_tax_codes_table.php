<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_codes', function (Blueprint $table) {
            $table->id();
            $table->string('tax_code')->unique();
            $table->string('tax_name');
            $table->decimal('rate', 5, 2);
            $table->enum('applicability', ['Sale', 'Purchase', 'Both']);
            $table->enum('tax_type', ['IGST', 'CGST', 'SGST', 'VAT', 'Other']);
            $table->string('jurisdiction')->nullable();
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('tax_code');
            $table->index('is_active');
            $table->index('effective_from');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_codes');
    }
};
