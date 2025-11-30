<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'currency_code',
        'currency_name',
        'symbol',
        'decimal_places',
        'is_base_currency',
        'is_active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'decimal_places' => 'integer',
            'is_base_currency' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the base currency.
     */
    public static function getBaseCurrency(): ?self
    {
        return static::where('is_base_currency', true)->first();
    }

    /**
     * Scope to only active currencies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
