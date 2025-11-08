<?php

namespace App\Services;

use InvalidArgumentException;

/**
 * Formula Engine
 *
 * Central library for all mathematical and physical calculations.
 * Pure code library (no data storage) containing functions for:
 * - CBM (Cubic Meter) calculations
 * - Volumetric Weight calculations
 * - Chargeable Weight determination
 */
class FormulaEngine
{
    /**
     * Calculate CBM (Cubic Meter) from dimensions
     *
     * Formula: (Length × Width × Height × Pieces) / 1,000,000
     * Assumes all dimensions are in centimeters (cm)
     *
     * @param  float  $length  Length in centimeters
     * @param  float  $width  Width in centimeters
     * @param  float  $height  Height in centimeters
     * @param  int|float  $pieces  Number of pieces (default: 1)
     * @return float CBM value
     *
     * @throws InvalidArgumentException If any dimension is negative or zero
     */
    public function calculateCBM(
        float $length,
        float $width,
        float $height,
        int|float $pieces = 1
    ): float {
        $this->validateDimensions($length, $width, $height, $pieces);

        return ($length * $width * $height * $pieces) / 1_000_000;
    }

    /**
     * Calculate Volumetric Weight
     *
     * Based on transportation mode:
     * - AIR: CBM × 167 (equivalent to ÷ 6,000)
     * - SEA_LCL: CBM × 1,000 (equivalent to ÷ 1 m³)
     * - RAIL: CBM × 333 (equivalent to ÷ 3,000)
     * - ROAD: CBM × 500 (equivalent to ÷ 2,000)
     *
     * @param  float  $cbm  Cubic Meter value
     * @param  string  $mode  Transportation mode (AIR, SEA_LCL, RAIL, ROAD, SEA_FCL)
     * @return float Volumetric Weight in kg
     *
     * @throws InvalidArgumentException If CBM is negative or mode is invalid
     */
    public function calculateVolumetricWeight(float $cbm, string $mode): float
    {
        if ($cbm < 0) {
            throw new InvalidArgumentException('CBM cannot be negative');
        }

        $mode = strtoupper(trim($mode));

        $volumetricFactors = [
            'AIR' => 167,          // 1 CBM = 167 kg in air freight
            'SEA_LCL' => 1000,     // 1 CBM = 1,000 kg in LCL (less than container load)
            'RAIL' => 333,         // 1 CBM = 333 kg in rail freight
            'ROAD' => 500,         // 1 CBM = 500 kg in road freight
            'SEA_FCL' => 1000,     // 1 CBM = 1,000 kg in FCL (full container load)
        ];

        if (! isset($volumetricFactors[$mode])) {
            throw new InvalidArgumentException(
                "Invalid mode '{$mode}'. Supported modes: ".implode(', ', array_keys($volumetricFactors))
            );
        }

        return $cbm * $volumetricFactors[$mode];
    }

    /**
     * Get Chargeable Weight
     *
     * Returns the maximum of actual weight and volumetric weight.
     * This is the weight used for freight cost calculations.
     *
     * @param  float  $actualWeight  Actual weight in kg
     * @param  float  $volumetricWeight  Volumetric weight in kg
     * @return float Chargeable weight in kg
     *
     * @throws InvalidArgumentException If any weight is negative
     */
    public function getChargeableWeight(float $actualWeight, float $volumetricWeight): float
    {
        if ($actualWeight < 0) {
            throw new InvalidArgumentException('Actual weight cannot be negative');
        }

        if ($volumetricWeight < 0) {
            throw new InvalidArgumentException('Volumetric weight cannot be negative');
        }

        return max($actualWeight, $volumetricWeight);
    }

    /**
     * Calculate all metrics in one call
     *
     * Convenient method to get CBM, volumetric weight, and chargeable weight
     * in a single operation.
     *
     * @param  array  $params  Array with keys:
     *                         - length: Length in cm
     *                         - width: Width in cm
     *                         - height: Height in cm
     *                         - pieces: Number of pieces (default: 1)
     *                         - actual_weight: Actual weight in kg
     *                         - mode: Transportation mode
     * @return array Result array with: cbm, volumetric_weight, chargeable_weight
     */
    public function calculateAll(array $params): array
    {
        $cbm = $this->calculateCBM(
            $params['length'] ?? 0,
            $params['width'] ?? 0,
            $params['height'] ?? 0,
            $params['pieces'] ?? 1
        );

        $volumetricWeight = $this->calculateVolumetricWeight(
            $cbm,
            $params['mode'] ?? 'AIR'
        );

        $chargeableWeight = $this->getChargeableWeight(
            $params['actual_weight'] ?? 0,
            $volumetricWeight
        );

        return [
            'cbm' => round($cbm, 6),
            'volumetric_weight' => round($volumetricWeight, 2),
            'chargeable_weight' => round($chargeableWeight, 2),
            'weight_type' => $chargeableWeight === $volumetricWeight ? 'volumetric' : 'actual',
        ];
    }

    /**
     * Validate dimension inputs
     *
     * @throws InvalidArgumentException If dimensions are invalid
     */
    private function validateDimensions(float $length, float $width, float $height, int|float $pieces): void
    {
        if ($length <= 0 || $width <= 0 || $height <= 0) {
            throw new InvalidArgumentException('Length, width, and height must be positive numbers');
        }

        if ($pieces < 1) {
            throw new InvalidArgumentException('Pieces must be at least 1');
        }
    }

    /**
     * Get all supported transportation modes and their factors
     *
     * @return array Array of modes with their volumetric factors
     */
    public function getSupportedModes(): array
    {
        return [
            'AIR' => ['name' => 'Air Freight', 'factor' => 167, 'divisor' => 6000],
            'SEA_LCL' => ['name' => 'Sea (LCL)', 'factor' => 1000, 'divisor' => 1000],
            'SEA_FCL' => ['name' => 'Sea (FCL)', 'factor' => 1000, 'divisor' => 1000],
            'RAIL' => ['name' => 'Rail', 'factor' => 333, 'divisor' => 3000],
            'ROAD' => ['name' => 'Road', 'factor' => 500, 'divisor' => 2000],
        ];
    }
}
