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
        Schema::create('quotation_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_header_id')->constrained('quotation_headers')->cascadeOnDelete();

            // Who submitted and who approves
            $table->foreignId('submitted_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approver_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Approval status
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending')->index();

            // Approval metadata
            $table->decimal('total_cost_inr', 12, 2);
            $table->decimal('total_sale_price_inr', 12, 2);
            $table->decimal('total_margin_percentage', 5, 2)->nullable();

            // Comments
            $table->text('approver_comments')->nullable();
            $table->text('rejection_reason')->nullable();

            // Timestamps
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();

            $table->timestamps();

            $table->index('quotation_header_id');
            $table->index('approval_status');
            $table->index('submitted_by_user_id');
            $table->index('approver_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_approvals');
    }
};
