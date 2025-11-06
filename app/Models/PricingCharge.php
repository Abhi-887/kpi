<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PricingCharge extends Model
{
    protected $fillable = [
        'rate_card_id',
        'name',
        'charge_type',
        'amount',
        'description',
        'is_optional',
        'apply_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_optional' => 'boolean',
        ];
    }

    public function rateCard(): BelongsTo
    {
        return $this->belongsTo(RateCard::class);
    }
}
