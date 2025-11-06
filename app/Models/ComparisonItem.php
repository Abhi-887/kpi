<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComparisonItem extends Model
{
    protected $fillable = [
        'price_comparison_id',
        'service_name',
        'our_rate',
        'competitor_rate',
        'difference',
        'status',
    ];

    protected $casts = [
        'our_rate' => 'decimal:2',
        'competitor_rate' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    public function comparison(): BelongsTo
    {
        return $this->belongsTo(PriceComparison::class, 'price_comparison_id');
    }
}
