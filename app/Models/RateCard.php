<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RateCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
        'service_type',
        'origin_country',
        'destination_country',
        'base_rate',
        'minimum_charge',
        'surcharge_percentage',
        'rules',
        'is_zone_based',
        'valid_days',
        'role_id',
    ];

    protected function casts(): array
    {
        return [
            'base_rate' => 'decimal:2',
            'minimum_charge' => 'decimal:2',
            'surcharge_percentage' => 'decimal:2',
            'rules' => 'array',
            'is_zone_based' => 'boolean',
        ];
    }

    public function charges(): HasMany
    {
        return $this->hasMany(PricingCharge::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function getRouteAttribute(): string
    {
        return "{$this->origin_country} → {$this->destination_country}";
    }
}
