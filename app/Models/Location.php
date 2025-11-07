<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'city',
        'country',
        'type',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function asOrigin(): HasMany
    {
        return $this->hasMany(VendorRateHeader::class, 'origin_port_id');
    }

    public function asDestination(): HasMany
    {
        return $this->hasMany(VendorRateHeader::class, 'destination_port_id');
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->code} - {$this->name}";
    }
}
