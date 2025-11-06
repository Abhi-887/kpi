<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourierPrice extends Model
{
    protected $fillable = [
        'name',
        'description',
        'carrier_name',
        'service_type',
        'base_price',
        'per_kg_price',
        'surcharge',
        'transit_days',
        'coverage_area',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'per_kg_price' => 'decimal:2',
        'surcharge' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
