<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxCode extends Model
{
    protected $fillable = [
        'tax_code',
        'tax_name',
        'rate',
        'applicability',
        'tax_type',
        'jurisdiction',
        'effective_from',
        'effective_to',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:2',
            'effective_from' => 'date',
            'effective_to' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function costComponents(): HasMany
    {
        return $this->hasMany(CostComponent::class, 'tax_code_id');
    }
}
