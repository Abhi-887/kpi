<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackagingPrice extends Model
{
    protected $fillable = [
        'name',
        'description',
        'package_type',
        'size_category',
        'length',
        'width',
        'height',
        'max_weight',
        'unit_price',
        'bulk_price_5',
        'bulk_price_10',
        'material',
        'is_active',
    ];

    protected $casts = [
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'max_weight' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'bulk_price_5' => 'decimal:2',
        'bulk_price_10' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
