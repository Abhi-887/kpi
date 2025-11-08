<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorRateHeader extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'mode',
        'movement',
        'origin_port_id',
        'destination_port_id',
        'terms',
        'valid_from',
        'valid_upto',
        'is_active',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'date',
            'valid_upto' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'vendor_id');
    }

    public function originPort(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'origin_port_id');
    }

    public function destinationPort(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_port_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(VendorRateLine::class, 'rate_header_id');
    }

    public function getRouteAttribute(): string
    {
        return "{$this->originPort->full_name} → {$this->destinationPort->full_name}";
    }

    public function isValidOn(\DateTime|\Carbon\Carbon|string $date = 'now'): bool
    {
        $checkDate = is_string($date) ? now() : \Carbon\Carbon::make($date);
        return $checkDate->greaterThanOrEqualTo($this->valid_from) && $checkDate->lessThanOrEqualTo($this->valid_upto);
    }
}
