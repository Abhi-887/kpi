<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorRateLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'rate_header_id',
        'charge_id',
        'uom_id',
        'currency_code',
        'slab_min',
        'slab_max',
        'cost_rate',
        'is_fixed_rate',
        'sequence',
        'is_active',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'slab_min' => 'decimal:2',
            'slab_max' => 'decimal:2',
            'cost_rate' => 'decimal:4',
            'is_fixed_rate' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function rateHeader(): BelongsTo
    {
        return $this->belongsTo(VendorRateHeader::class, 'rate_header_id');
    }

    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }

    public function matchesWeight($weight): bool
    {
        return $weight >= $this->slab_min && $weight <= $this->slab_max;
    }
}
