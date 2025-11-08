<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationCostLine extends Model
{
    use HasFactory;

    protected $table = 'quotation_cost_lines';

    protected $fillable = [
        'quotation_header_id',
        'charge_id',
        'all_vendor_costs',
        'selected_vendor_id',
        'unit_cost_rate',
        'unit_cost_currency',
        'cost_exchange_rate',
        'total_cost_inr',
    ];

    protected function casts(): array
    {
        return [
            'all_vendor_costs' => 'array',
            'unit_cost_rate' => 'decimal:2',
            'cost_exchange_rate' => 'decimal:6',
            'total_cost_inr' => 'decimal:2',
        ];
    }

    public function quotationHeader(): BelongsTo
    {
        return $this->belongsTo(QuotationHeader::class, 'quotation_header_id');
    }

    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }

    public function selectedVendor(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'selected_vendor_id');
    }

    /**
     * Calculate total cost in INR
     * Formula: unit_cost_rate * cost_exchange_rate
     */
    public function calculateTotalCostInr(): float
    {
        return ((float) $this->unit_cost_rate * (float) $this->cost_exchange_rate);
    }

    /**
     * Check if current selection is the cheapest (Rank 1)
     * Compare selected_vendor_id against all_vendor_costs
     */
    public function isCurrentSelectionCheapest(): bool
    {
        if (! $this->all_vendor_costs) {
            return true; // No alternatives
        }

        $vendorCosts = $this->all_vendor_costs;
        $minCost = min($vendorCosts);
        $currentCost = (float) $this->unit_cost_rate * (float) $this->cost_exchange_rate;

        // Allow small floating point difference (0.01)
        return abs($currentCost - $minCost) < 0.01;
    }

    /**
     * Get all vendor options formatted for display
     * Returns array: [['vendor_id' => 1, 'vendor_name' => 'Arun', 'cost' => 120], ...]
     */
    public function getVendorOptionsAttribute(): array
    {
        if (! $this->all_vendor_costs) {
            return [];
        }

        $options = [];
        foreach ($this->all_vendor_costs as $vendorId => $cost) {
            $vendor = Supplier::find($vendorId);
            if ($vendor) {
                $options[] = [
                    'vendor_id' => $vendor->id,
                    'vendor_name' => $vendor->name,
                    'cost' => (float) $cost,
                    'is_current_selection' => $this->selected_vendor_id == $vendor->id,
                    'is_rank_1' => abs((float) $cost - min($this->all_vendor_costs)) < 0.01,
                ];
            }
        }

        // Sort by cost ascending (Rank 1 first)
        usort($options, fn ($a, $b) => $a['cost'] <=> $b['cost']);

        return $options;
    }

    /**
     * Scope: Get cost lines with cheapest option highlighted
     */
    public function scopeWithRanking($query)
    {
        return $query->with('charge', 'selectedVendor');
    }

    /**
     * Scope: Get cost lines for a quotation with all vendor info
     */
    public function scopeForQuotation($query, QuotationHeader $quotation)
    {
        return $query->where('quotation_header_id', $quotation->id)->with('charge', 'selectedVendor');
    }
}
