<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarginRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'precedence',
        'charge_id',
        'customer_id',
        'margin_percentage',
        'margin_fixed_inr',
        'is_active',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'margin_percentage' => 'decimal:4',
            'margin_fixed_inr' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
