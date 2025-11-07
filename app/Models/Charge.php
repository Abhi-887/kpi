<?php

namespace App\Models;

use App\Enums\ChargeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Charge extends Model
{
    use HasFactory;

    protected $fillable = [
        'charge_id',
        'charge_code',
        'charge_name',
        'default_uom_id',
        'default_tax_id',
        'default_fixed_rate_inr',
        'charge_type',
        'is_active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'charge_type' => ChargeType::class,
            'default_fixed_rate_inr' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function defaultUom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'default_uom_id');
    }

    public function defaultTax(): BelongsTo
    {
        return $this->belongsTo(TaxCode::class, 'default_tax_id');
    }
}
