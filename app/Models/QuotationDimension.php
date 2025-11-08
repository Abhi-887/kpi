<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationDimension extends Model
{
    use HasFactory;

    protected $table = 'quotation_dimensions';

    protected $fillable = [
        'quotation_header_id',
        'length_cm',
        'width_cm',
        'height_cm',
        'pieces',
        'actual_weight_per_piece_kg',
        'sequence',
    ];

    protected function casts(): array
    {
        return [
            'length_cm' => 'decimal:2',
            'width_cm' => 'decimal:2',
            'height_cm' => 'decimal:2',
            'pieces' => 'integer',
            'actual_weight_per_piece_kg' => 'decimal:2',
        ];
    }

    public function quotationHeader(): BelongsTo
    {
        return $this->belongsTo(QuotationHeader::class, 'quotation_header_id');
    }

    /**
     * Get CBM per piece (calculated)
     * Formula: (L * W * H) / 1,000,000
     */
    public function getCbmPerPieceAttribute(): float
    {
        if (! $this->length_cm || ! $this->width_cm || ! $this->height_cm) {
            return 0;
        }

        return ((float) $this->length_cm * (float) $this->width_cm * (float) $this->height_cm) / 1_000_000;
    }

    /**
     * Get total weight for row
     * Formula: actual_weight_per_piece_kg * pieces
     */
    public function getTotalWeightForRowKgAttribute(): float
    {
        return ((float) $this->actual_weight_per_piece_kg * $this->pieces);
    }

    /**
     * Get total CBM for row
     * Formula: cbm_per_piece * pieces
     */
    public function getTotalCbmForRowAttribute(): float
    {
        return ($this->cbm_per_piece * $this->pieces);
    }

    /**
     * Get volumetric weight (for AIR/SEA based on mode)
     * Formula: CBM * Divisor (default 167 for air)
     * Can be overridden based on Incoterm/Mode
     */
    public function getVolumetricWeightAttribute(?int $divisor = null): float
    {
        $divisor = $divisor ?? config('app.volumetric_divisor', 167);

        return $this->total_cbm_for_row * $divisor;
    }

    /**
     * Scope: Order dimensions by sequence
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sequence', 'asc')->orderBy('created_at', 'asc');
    }
}
