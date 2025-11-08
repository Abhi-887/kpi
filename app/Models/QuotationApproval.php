<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_header_id',
        'submitted_by_user_id',
        'approver_user_id',
        'approval_status',
        'total_cost_inr',
        'total_sale_price_inr',
        'total_margin_percentage',
        'approver_comments',
        'rejection_reason',
        'submitted_at',
        'approved_at',
        'rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'total_cost_inr' => 'decimal:2',
            'total_sale_price_inr' => 'decimal:2',
            'total_margin_percentage' => 'decimal:2',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function quotationHeader(): BelongsTo
    {
        return $this->belongsTo(QuotationHeader::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_user_id');
    }

    /**
     * Approve the quotation
     */
    public function approve(User $approver, ?string $comments = null): void
    {
        $this->approver_user_id = $approver->id;
        $this->approval_status = 'approved';
        $this->approver_comments = $comments;
        $this->approved_at = now();
        $this->save();

        // Update quotation header status
        $this->quotationHeader->update(['quote_status' => 'sent']);
    }

    /**
     * Reject the quotation
     */
    public function reject(User $approver, string $reason): void
    {
        $this->approver_user_id = $approver->id;
        $this->approval_status = 'rejected';
        $this->rejection_reason = $reason;
        $this->rejected_at = now();
        $this->save();

        // Update quotation header status back to draft for rework
        $this->quotationHeader->update(['quote_status' => 'draft']);
    }

    /**
     * Check if approval is pending
     */
    public function isPending(): bool
    {
        return $this->approval_status === 'pending';
    }

    /**
     * Check if already approved
     */
    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /**
     * Check if rejected
     */
    public function isRejected(): bool
    {
        return $this->approval_status === 'rejected';
    }
}
