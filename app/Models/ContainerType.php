<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContainerType extends Model
{
    use HasFactory;

    protected $primaryKey = 'container_type_id';

    protected $fillable = [
        'container_code',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function rateCards(): HasMany
    {
        return $this->hasMany(RateCard::class);
    }

    public function pricingCharges(): HasMany
    {
        return $this->hasMany(PricingCharge::class);
    }
}
