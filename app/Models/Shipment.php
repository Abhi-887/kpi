<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_number',
        'reference_number',
        'status',
        'origin_city',
        'origin_country',
        'destination_city',
        'destination_country',
        'weight',
        'length',
        'width',
        'height',
        'item_description',
        'item_quantity',
        'declared_value',
        'service_type',
        'carrier',
        'pickup_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'base_freight',
        'handling_charge',
        'tax',
        'total_cost',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'pickup_date' => 'date',
            'expected_delivery_date' => 'date',
            'actual_delivery_date' => 'date',
            'weight' => 'decimal:2',
            'length' => 'decimal:2',
            'width' => 'decimal:2',
            'height' => 'decimal:2',
            'declared_value' => 'decimal:2',
            'base_freight' => 'decimal:2',
            'handling_charge' => 'decimal:2',
            'tax' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function getFullOriginAttribute(): string
    {
        return "{$this->origin_city}, {$this->origin_country}";
    }

    public function getFullDestinationAttribute(): string
    {
        return "{$this->destination_city}, {$this->destination_country}";
    }

    public function getDimensionsAttribute(): string
    {
        if ($this->length && $this->width && $this->height) {
            return "{$this->length}x{$this->width}x{$this->height} cm";
        }

        return 'N/A';
    }
}
