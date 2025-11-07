<?php

namespace App\Services;

use App\Models\VendorRateHeader;
use App\Models\VendorRateLine;
use Illuminate\Support\Collection;

/**
 * Rate Management Engine
 *
 * Central high-speed query engine for all vendor costs.
 * Primary responsibility: Answer the question - "For this specific shipment, what are the costs from all my vendors?"
 */
class RateEngine
{
    /**
     * Find all matching costs for a shipment
     *
     * @param  array  $shipmentDetails  Shipment details array with keys:
     *                                  - origin_port_id: Origin location ID
     *                                  - destination_port_id: Destination location ID
     *                                  - mode: Transportation mode (AIR, SEA, ROAD, RAIL, MULTIMODAL)
     *                                  - movement: Type of movement (IMPORT, EXPORT, DOMESTIC, INTER_MODAL)
     *                                  - terms: Incoterms (EXW, FCA, CPT, CIP, DAP, DDP, FOB, CFR, CIF)
     *                                  - chargeable_weight: Weight in the UOM for calculation
     *                                  - date: Date to check validity (defaults to today)
     * @return Collection Grouped costs by vendor with vendor_id, vendor_name, route, mode, movement, terms, charges
     */
    public function findMatchingCosts(array $shipmentDetails): Collection
    {
        $query = VendorRateHeader::query()
            ->with(['vendor', 'originPort', 'destinationPort', 'lines.charge', 'lines.uom'])
            ->where('is_active', true)
            ->where('origin_port_id', $shipmentDetails['origin_port_id'])
            ->where('destination_port_id', $shipmentDetails['destination_port_id'])
            ->where('mode', $shipmentDetails['mode'])
            ->where('movement', $shipmentDetails['movement'])
            ->where('terms', $shipmentDetails['terms'])
            ->where('valid_from', '<=', $shipmentDetails['date'] ?? now())
            ->where('valid_upto', '>=', $shipmentDetails['date'] ?? now());

        $headers = $query->get();

        return $headers->map(function (VendorRateHeader $header) use ($shipmentDetails) {
            $chargeableWeight = $shipmentDetails['chargeable_weight'] ?? 0;

            $matchingLines = $header->lines
                ->filter(fn (VendorRateLine $line) => $line->is_active && $line->matchesWeight($chargeableWeight))
                ->values();

            return [
                'vendor_id' => $header->vendor_id,
                'vendor_name' => $header->vendor->name,
                'vendor_code' => $header->vendor->supplier_id ?? null,
                'rate_header_id' => $header->id,
                'route' => "{$header->originPort->code} → {$header->destinationPort->code}",
                'mode' => $header->mode,
                'movement' => $header->movement,
                'terms' => $header->terms,
                'valid_from' => $header->valid_from,
                'valid_upto' => $header->valid_upto,
                'charges' => $matchingLines->map(function (VendorRateLine $line) {
                    return [
                        'rate_line_id' => $line->id,
                        'charge_id' => $line->charge_id,
                        'charge_code' => $line->charge->charge_code,
                        'charge_name' => $line->charge->charge_name,
                        'slab_min' => (float) $line->slab_min,
                        'slab_max' => (float) $line->slab_max,
                        'cost_rate' => (float) $line->cost_rate,
                        'currency' => $line->currency_code,
                        'is_fixed_rate' => $line->is_fixed_rate,
                        'uom_id' => $line->uom_id,
                        'uom_symbol' => $line->uom->symbol,
                        'notes' => $line->notes,
                    ];
                })->values()->all(),
            ];
        })
            ->filter(fn ($vendor) => count($vendor['charges']) > 0)
            ->values();
    }

    /**
     * Get available rates for a specific charge and weight range
     */
    public function findRatesForCharge(
        int $originPortId,
        int $destinationPortId,
        string $mode,
        string $movement,
        string $terms,
        int $chargeId,
        ?string $date = null
    ): Collection {
        $date = $date ? \Carbon\Carbon::parse($date) : now();

        return VendorRateLine::query()
            ->with(['rateHeader.vendor', 'charge', 'uom'])
            ->whereHas('rateHeader', function ($query) use ($originPortId, $destinationPortId, $mode, $movement, $terms, $date) {
                $query->where('is_active', true)
                    ->where('origin_port_id', $originPortId)
                    ->where('destination_port_id', $destinationPortId)
                    ->where('mode', $mode)
                    ->where('movement', $movement)
                    ->where('terms', $terms)
                    ->where('valid_from', '<=', $date)
                    ->where('valid_upto', '>=', $date);
            })
            ->where('charge_id', $chargeId)
            ->where('is_active', true)
            ->orderBy('slab_min')
            ->get();
    }

    /**
     * Validate rate headers for conflicts or issues
     */
    public function validateRateHeader(int $rateHeaderId): array
    {
        $header = VendorRateHeader::with('lines')->findOrFail($rateHeaderId);
        $issues = [];

        // Check if dates are valid
        if ($header->valid_from->lte($header->valid_upto) === false) {
            $issues[] = 'Valid From date is after Valid Upto date';
        }

        // Check for slab overlaps
        $slabs = $header->lines->groupBy('charge_id')->map(function ($lines) {
            return $lines->sortBy('slab_min')->values();
        });

        foreach ($slabs as $chargeId => $lines) {
            for ($i = 0; $i < $lines->count() - 1; $i++) {
                $current = $lines[$i];
                $next = $lines[$i + 1];

                // Check for overlapping slabs
                if ($current->slab_max >= $next->slab_min) {
                    $issues[] = "Slab overlap for Charge ID {$chargeId}: {$current->slab_min}-{$current->slab_max} and {$next->slab_min}-{$next->slab_max}";
                }

                // Check for gaps
                if ($current->slab_max < $next->slab_min - 1) {
                    $issues[] = "Slab gap for Charge ID {$chargeId}: between {$current->slab_max} and {$next->slab_min}";
                }
            }
        }

        return [
            'is_valid' => empty($issues),
            'issues' => $issues,
        ];
    }

    /**
     * Calculate total cost for a shipment from a specific vendor
     */
    public function calculateVendorCost(
        int $rateHeaderId,
        float $chargeableWeight,
        ?array $excludeCharges = null
    ): float {
        $lines = VendorRateLine::query()
            ->where('rate_header_id', $rateHeaderId)
            ->where('is_active', true)
            ->when($excludeCharges, function ($query, $exclude) {
                return $query->whereNotIn('charge_id', $exclude);
            })
            ->get();

        $total = 0;

        foreach ($lines as $line) {
            if ($line->matchesWeight($chargeableWeight)) {
                if ($line->is_fixed_rate) {
                    $total += (float) $line->cost_rate;
                } else {
                    $total += (float) $line->cost_rate * $chargeableWeight;
                }
            }
        }

        return $total;
    }
}
