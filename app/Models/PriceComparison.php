<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PriceComparison extends Model
{
    protected $fillable = [
        'user_id',
        'rate_card_id',
        'login_id',
        'our_price',
        'competitor_price',
        'price_difference',
        'status',
        'notes',
    ];

    protected $casts = [
        'our_price' => 'decimal:2',
        'competitor_price' => 'decimal:2',
        'price_difference' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rateCard(): BelongsTo
    {
        return $this->belongsTo(RateCard::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ComparisonItem::class);
    }
}
