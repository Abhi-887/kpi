<?php

namespace App\Models;

use App\Enums\QuotationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuotationHeader extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'quote_id',
        'quote_status',
        'created_by_user_id',
        'salesperson_user_id',
        'customer_id',
        'mode',
        'movement',
        'terms',
        'origin_port_id',
        'destination_port_id',
        'origin_location_id',
        'destination_location_id',
        'total_chargeable_weight',
        'total_cbm',
        'total_pieces',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quote_status' => QuotationStatus::class,
            'total_chargeable_weight' => 'decimal:2',
            'total_cbm' => 'decimal:4',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function salesperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'salesperson_user_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function originPort(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'origin_port_id');
    }

    public function destinationPort(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_port_id');
    }

    public function originLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'origin_location_id');
    }

    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_location_id');
    }

    public function dimensions(): HasMany
    {
        return $this->hasMany(QuotationDimension::class);
    }

    public function costLines(): HasMany
    {
        return $this->hasMany(QuotationCostLine::class);
    }

    public function saleLines(): HasMany
    {
        return $this->hasMany(QuotationSaleLine::class);
    }

    public function approval(): HasOne
    {
        return $this->hasOne(QuotationApproval::class, 'quotation_header_id')->latestOfMany();
    }

    // Accessors
    public function getTotalCostInrAttribute(): float
    {
        return (float) $this->costLines()->sum('total_cost_inr');
    }

    public function getTotalSalePriceInrAttribute(): float
    {
        return (float) $this->saleLines()->sum('total_sale_price_inr');
    }

    public function getTotalSalePriceWithTaxAttribute(): float
    {
        return (float) $this->saleLines()->sum('line_total_with_tax_inr');
    }

    public function getMarginPercentageAttribute(): ?float
    {
        $totalCost = $this->total_cost_inr;

        if ($totalCost == 0) {
            return null;
        }

        return (($this->total_sale_price_inr - $totalCost) / $totalCost) * 100;
    }

    public function isApprovalRequired(): bool
    {
        $totalCost = $this->total_cost_inr;
        $marginPercentage = $this->margin_percentage ?? 0;

        // Trigger approval if cost > 10000 or margin < 10%
        return $totalCost > 10000 || $marginPercentage < 10;
    }

    public function getStatusColorAttribute(): string
    {
        return $this->quote_status->color();
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->quote_status->label();
    }

    public function getStatusIconAttribute(): string
    {
        return $this->quote_status->icon();
    }
}
