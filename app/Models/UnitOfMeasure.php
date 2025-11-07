<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitOfMeasure extends Model
{
    use HasFactory;

    protected $table = 'unit_of_measures';

    protected $fillable = [
        'name',
        'symbol',
        'base_uom_id',
        'conversion_factor',
        'category',
    ];

    protected function casts(): array
    {
        return [
            'conversion_factor' => 'decimal:4',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'unit_of_measure_id');
    }

    public function costComponents(): HasMany
    {
        return $this->hasMany(CostComponent::class, 'unit_of_measure_id');
    }
}
