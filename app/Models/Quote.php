<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'shipment_id',
        'rate_card_id',
        'origin_country',
        'destination_country',
        'service_type',
        'weight',
        'weight_unit',
        'base_cost',
        'charges_total',
        'surcharge',
        'total_cost',
        'currency_rate',
        'currency',
        'total_in_currency',
        'status',
        'valid_until',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
            'base_cost' => 'decimal:2',
            'charges_total' => 'decimal:2',
            'surcharge' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'currency_rate' => 'decimal:6',
            'total_in_currency' => 'decimal:2',
            'valid_until' => 'datetime',
        ];
    }

    public function rateCard(): BelongsTo
    {
        return $this->belongsTo(RateCard::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function generateReferenceNumber(): string
    {
        return 'QT-'.date('Ymd').'-'.str_pad($this->id ?? 0, 5, '0', STR_PAD_LEFT);
    }
}
