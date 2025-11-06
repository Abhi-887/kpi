<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForwardingPrice extends Model
{
    protected $fillable = [
        'name',
        'description',
        'origin_country',
        'destination_country',
        'service_type',
        'base_price',
        'per_kg_price',
        'per_cbm_price',
        'handling_fee',
        'transit_days',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'per_kg_price' => 'decimal:2',
        'per_cbm_price' => 'decimal:2',
        'handling_fee' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
