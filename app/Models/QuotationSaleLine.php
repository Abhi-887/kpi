<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationSaleLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_header_id',
        'charge_id',
        'display_name',
        'quantity',
        'unit_sale_rate',
        'sale_currency',
        'total_sale_price_inr',
        'tax_rate',
        'tax_amount_inr',
        'line_total_with_tax_inr',
        'internal_cost_inr',
        'margin_percentage',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_sale_rate' => 'decimal:2',
            'total_sale_price_inr' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount_inr' => 'decimal:2',
            'line_total_with_tax_inr' => 'decimal:2',
            'internal_cost_inr' => 'decimal:2',
            'margin_percentage' => 'decimal:2',
        ];
    }

    public function quotationHeader(): BelongsTo
    {
        return $this->belongsTo(QuotationHeader::class);
    }

    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }

    /**
     * Calculate margin percentage: ((sale_price - cost) / cost) * 100
     */
    public function calculateMarginPercentage(): float
    {
        if (! $this->internal_cost_inr || $this->internal_cost_inr == 0) {
            return 0;
        }

        return (($this->total_sale_price_inr - $this->internal_cost_inr) / $this->internal_cost_inr) * 100;
    }

    /**
     * Calculate total with tax
     */
    public function calculateTotalWithTax(): float
    {
        return $this->total_sale_price_inr + $this->tax_amount_inr;
    }

    /**
     * Recalculate tax amount based on tax rate and total sale price
     */
    public function recalculateTax(): void
    {
        $this->setAttribute('tax_amount_inr', ($this->total_sale_price_inr * $this->tax_rate) / 100);
        $this->setAttribute('line_total_with_tax_inr', $this->calculateTotalWithTax());
    }
}
