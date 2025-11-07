<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $fillable = [
        'item_code',
        'sku',
        'name',
        'description',
        'category',
        'unit_of_measure_id',
        'default_cost',
        'default_price',
        'weight',
        'length',
        'width',
        'height',
        'hsn_sac',
        'active_flag',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'default_cost' => 'decimal:2',
            'default_price' => 'decimal:2',
            'weight' => 'decimal:4',
            'length' => 'decimal:4',
            'width' => 'decimal:4',
            'height' => 'decimal:4',
            'active_flag' => 'boolean',
        ];
    }

    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'unit_of_measure_id');
    }

    public function costComponents(): HasMany
    {
        return $this->hasMany(CostComponent::class);
    }

    public function priceLists(): HasMany
    {
        return $this->hasMany(PriceList::class);
    }
}
