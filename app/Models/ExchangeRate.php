<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_currency',
        'to_currency',
        'rate',
        'inverse_rate',
        'effective_date',
        'expiry_date',
        'source',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:6',
            'inverse_rate' => 'decimal:6',
            'effective_date' => 'date',
            'expiry_date' => 'date',
        ];
    }

    public static function getRate(string $fromCurrency, string $toCurrency, ?string $date = null): ?float
    {
        $date = $date ?? today();

        $rate = static::query()
            ->where('from_currency', $fromCurrency)
            ->where('to_currency', $toCurrency)
            ->where('effective_date', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', $date);
            })
            ->where('status', 'active')
            ->orderBy('effective_date', 'desc')
            ->first();

        return $rate ? (float) $rate->rate : null;
    }

    public static function convert(float $amount, string $fromCurrency, string $toCurrency, ?string $date = null): ?float
    {
        $rate = static::getRate($fromCurrency, $toCurrency, $date);

        return $rate ? $amount * $rate : null;
    }
}
