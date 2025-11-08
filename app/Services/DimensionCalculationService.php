<?php

namespace App\Services;

use App\Models\QuotationDimension;
use App\Models\QuotationHeader;

class DimensionCalculationService
{
    /**
     * Calculate all dimensions for a quotation
     * Called after dimension rows are added/updated
     *
     * @return array ['total_weight' => X, 'total_cbm' => Y, 'total_pieces' => Z]
     */
    public function calculateTotals(QuotationHeader $quotation): array
    {
        $dimensions = $quotation->dimensions;

        $totalWeight = 0;
        $totalCbm = 0;
        $totalPieces = 0;

        foreach ($dimensions as $dimension) {
            // Calculate weight
            $actualWeight = (float) $dimension->actual_weight_per_piece_kg * $dimension->pieces;
            $dimension->total_actual_weight_kg = $actualWeight;

            // Calculate CBM (Length x Width x Height in meters / 1,000,000)
            $cbmPerPiece = (((float) $dimension->length_cm * (float) $dimension->width_cm * (float) $dimension->height_cm) / 1_000_000);
            $totalCbm_row = $cbmPerPiece * $dimension->pieces;
            $dimension->volume_cbm = $totalCbm_row;

            // Calculate volumetric weight (CBM * 167 for AIR, * 1000 for SEA)
            $divisor = $this->getVolumetricDivisor($quotation->mode);
            $volumetricWeight = $totalCbm_row * $divisor;
            $dimension->volumetric_weight_kg = $volumetricWeight;

            $dimension->save();

            // Accumulate
            $totalWeight += $actualWeight;
            $totalCbm += $totalCbm_row;
            $totalPieces += $dimension->pieces;
        }

        // Calculate final chargeable weight (max of actual vs volumetric for AIR)
        $chargeableWeight = $this->calculateChargeableWeight($dimensions, $quotation->mode);

        // Update quotation header
        $quotation->update([
            'total_chargeable_weight' => $chargeableWeight,
            'total_cbm' => $totalCbm,
            'total_pieces' => $totalPieces,
        ]);

        return [
            'total_weight' => $totalWeight,
            'total_cbm' => $totalCbm,
            'total_pieces' => $totalPieces,
            'total_chargeable_weight' => $chargeableWeight,
        ];
    }

    /**
     * Calculate chargeable weight for a quotation
     * For AIR: max(actual_weight, volumetric_weight)
     * For SEA: max(actual_weight, volumetric_weight) but volumetric usually doesn't apply
     * For ROAD/RAIL: actual weight
     */
    public function calculateChargeableWeight(array|\Illuminate\Database\Eloquent\Collection $dimensions, string $mode): float
    {
        if (empty($dimensions)) {
            return 0;
        }

        $totalActualWeight = 0;
        $totalVolumetricWeight = 0;

        foreach ($dimensions as $dimension) {
            $totalActualWeight += (float) $dimension->total_actual_weight_kg;
            $totalVolumetricWeight += (float) $dimension->volumetric_weight_kg;
        }

        // For AIR mode, use the higher of actual vs volumetric
        if ($mode === 'AIR') {
            return max($totalActualWeight, $totalVolumetricWeight);
        }

        // For SEA, ROAD, RAIL - use actual weight
        return $totalActualWeight;
    }

    /**
     * Get divisor for volumetric weight calculation based on mode
     * AIR: 167 kg/m³ (industry standard)
     * SEA: 1000 kg/m³
     */
    private function getVolumetricDivisor(string $mode): int
    {
        return match ($mode) {
            'AIR' => 167,
            'SEA' => 1000,
            default => 167, // Default to AIR divisor
        };
    }

    /**
     * Update a single dimension and recalculate totals
     */
    public function updateDimension(QuotationDimension $dimension, array $data): QuotationDimension
    {
        $dimension->update($data);

        // Recalculate all totals for the quotation
        $this->calculateTotals($dimension->quotationHeader);

        return $dimension->fresh();
    }

    /**
     * Add a new dimension and recalculate totals
     */
    public function addDimension(QuotationHeader $quotation, array $data): QuotationDimension
    {
        $dimension = $quotation->dimensions()->create($data);

        // Recalculate all totals
        $this->calculateTotals($quotation);

        return $dimension->fresh();
    }

    /**
     * Delete a dimension and recalculate totals
     */
    public function deleteDimension(QuotationDimension $dimension): bool
    {
        $quotation = $dimension->quotationHeader;
        $result = $dimension->delete();

        // Recalculate totals
        if ($result) {
            $this->calculateTotals($quotation);
        }

        return $result;
    }
}
