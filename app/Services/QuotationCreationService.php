<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Location;
use App\Models\QuotationDimension;
use App\Models\QuotationHeader;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class QuotationCreationService
{
    public function __construct(
        protected FormulaEngine $formulaEngine
    ) {}

    /**
     * Create a new quotation with all its dimensions
     * This is the core "Create Quotation" logic for Module 19
     */
    public function createQuotation(
        User $createdBy,
        Customer $customer,
        string $mode,
        string $movement,
        string $terms,
        Location $originPort,
        Location $destinationPort,
        ?Location $originLocation,
        ?Location $destinationLocation,
        array $dimensions,
        ?User $salesperson = null,
        ?string $notes = null
    ): QuotationHeader {
        return DB::transaction(function () use (
            $createdBy,
            $customer,
            $mode,
            $movement,
            $terms,
            $originPort,
            $destinationPort,
            $originLocation,
            $destinationLocation,
            $dimensions,
            $salesperson,
            $notes
        ) {
            // 1. Create the quotation header
            $quotation = new QuotationHeader([
                'quote_status' => 'Draft',
                'created_by_user_id' => $createdBy->id,
                'salesperson_user_id' => $salesperson?->id,
                'customer_id' => $customer->id,
                'mode' => $mode,
                'movement' => $movement,
                'terms' => $terms,
                'origin_port_id' => $originPort->id,
                'destination_port_id' => $destinationPort->id,
                'origin_location_id' => $originLocation?->id,
                'destination_location_id' => $destinationLocation?->id,
                'notes' => $notes,
            ]);

            // Generate unique quote_id
            $quotation->quote_id = $quotation->generateQuoteId();
            $quotation->save();

            // 2. Create dimension records
            $this->createDimensions($quotation, $dimensions);

            // 3. Calculate and store totals
            $this->recalculateTotals($quotation);

            return $quotation->refresh();
        });
    }

    /**
     * Create dimension records for a quotation
     */
    protected function createDimensions(QuotationHeader $quotation, array $dimensionsData): void
    {
        foreach ($dimensionsData as $index => $dim) {
            QuotationDimension::create([
                'quotation_header_id' => $quotation->id,
                'length_cm' => $dim['length_cm'],
                'width_cm' => $dim['width_cm'],
                'height_cm' => $dim['height_cm'],
                'pieces' => $dim['pieces'],
                'actual_weight_per_piece_kg' => $dim['actual_weight_per_piece_kg'],
                'sequence' => $index,
            ]);
        }
    }

    /**
     * Recalculate all totals for a quotation
     * Calls Formula Engine for volumetric calculations
     */
    public function recalculateTotals(QuotationHeader $quotation): void
    {
        // Get all dimensions
        $dimensions = $quotation->dimensions()->ordered()->get();

        if ($dimensions->isEmpty()) {
            return;
        }

        // Calculate totals using stored formulas
        $totalActualWeight = $dimensions->sum('total_weight_for_row_kg');
        $totalCbm = $dimensions->sum('total_cbm_for_row');
        $totalPieces = $dimensions->sum('pieces');

        // Get volumetric divisor (air freight default = 167, sea freight = 1000)
        $volumetricDivisor = $this->getVolumetricDivisor($quotation->mode);

        // Calculate volumetric weight
        $volumetricWeight = $totalCbm * $volumetricDivisor;

        // Chargeable weight = MAX(actual_weight, volumetric_weight)
        $chargeableWeight = max($totalActualWeight, $volumetricWeight);

        // Update quotation
        $quotation->update([
            'total_actual_weight' => $totalActualWeight,
            'total_cbm' => $totalCbm,
            'total_pieces' => $totalPieces,
            'total_chargeable_weight' => $chargeableWeight,
        ]);
    }

    /**
     * Get volumetric divisor based on mode
     * AIR: 167 kg/cbm (standard air freight)
     * SEA: 1000 kg/cbm (1 ton per CBM)
     * ROAD: 300 kg/cbm
     * RAIL: 500 kg/cbm
     */
    protected function getVolumetricDivisor(string $mode): int
    {
        return match ($mode) {
            'AIR' => 167,
            'SEA' => 1000,
            'ROAD' => 300,
            'RAIL' => 500,
            default => 167,
        };
    }

    /**
     * Get quotation data formatted for frontend display
     * Returns all necessary data for quotation views
     */
    public function getQuotationData(QuotationHeader $quotation): array
    {
        $quotation->load([
            'customer',
            'createdBy',
            'salesperson',
            'originPort',
            'destinationPort',
            'originLocation',
            'destinationLocation',
            'dimensions',
            'costLines.charge',
            'costLines.selectedVendor',
        ]);

        $dimensions = $quotation->dimensions()->ordered()->get()->map(fn ($dim) => [
            'id' => $dim->id,
            'length_cm' => (float) $dim->length_cm,
            'width_cm' => (float) $dim->width_cm,
            'height_cm' => (float) $dim->height_cm,
            'pieces' => $dim->pieces,
            'actual_weight_per_piece_kg' => (float) $dim->actual_weight_per_piece_kg,
            'cbm_per_piece' => (float) $dim->cbm_per_piece,
            'total_weight_for_row_kg' => (float) $dim->total_weight_for_row_kg,
            'total_cbm_for_row' => (float) $dim->total_cbm_for_row,
            'sequence' => $dim->sequence,
        ])->toArray();

        return [
            'id' => $quotation->id,
            'quote_id' => $quotation->quote_id,
            'quote_status' => $quotation->quote_status,
            'customer' => [
                'id' => $quotation->customer->id,
                'company_name' => $quotation->customer->company_name,
                'primary_contact_name' => $quotation->customer->primary_contact_name,
                'email' => $quotation->customer->email,
                'phone' => $quotation->customer->phone,
            ],
            'created_by' => [
                'id' => $quotation->createdBy->id,
                'name' => $quotation->createdBy->name,
            ],
            'salesperson' => $quotation->salesperson ? [
                'id' => $quotation->salesperson->id,
                'name' => $quotation->salesperson->name,
            ] : null,
            'shipment_details' => [
                'mode' => $quotation->mode,
                'movement' => $quotation->movement,
                'terms' => $quotation->terms,
                'origin_port' => [
                    'id' => $quotation->originPort->id,
                    'code' => $quotation->originPort->code,
                    'name' => $quotation->originPort->name,
                    'city' => $quotation->originPort->city,
                    'country' => $quotation->originPort->country,
                ],
                'destination_port' => [
                    'id' => $quotation->destinationPort->id,
                    'code' => $quotation->destinationPort->code,
                    'name' => $quotation->destinationPort->name,
                    'city' => $quotation->destinationPort->city,
                    'country' => $quotation->destinationPort->country,
                ],
                'origin_location' => $quotation->originLocation ? [
                    'id' => $quotation->originLocation->id,
                    'code' => $quotation->originLocation->code,
                    'name' => $quotation->originLocation->name,
                ] : null,
                'destination_location' => $quotation->destinationLocation ? [
                    'id' => $quotation->destinationLocation->id,
                    'code' => $quotation->destinationLocation->code,
                    'name' => $quotation->destinationLocation->name,
                ] : null,
            ],
            'totals' => [
                'total_actual_weight' => (float) $quotation->total_actual_weight,
                'total_cbm' => (float) $quotation->total_cbm,
                'total_pieces' => $quotation->total_pieces,
                'total_chargeable_weight' => (float) $quotation->total_chargeable_weight,
            ],
            'dimensions' => $dimensions,
            'notes' => $quotation->notes,
            'created_at' => $quotation->created_at->toIso8601String(),
            'updated_at' => $quotation->updated_at->toIso8601String(),
        ];
    }

    /**
     * Update quotation with new dimensions
     * Recalculates all totals after update
     */
    public function updateQuotationDimensions(QuotationHeader $quotation, array $dimensionsData): void
    {
        DB::transaction(function () use ($quotation, $dimensionsData) {
            // Delete existing dimensions
            $quotation->dimensions()->delete();

            // Create new dimensions
            $this->createDimensions($quotation, $dimensionsData);

            // Recalculate totals
            $this->recalculateTotals($quotation);
        });
    }

    /**
     * Validate quotation is ready for costing
     */
    public function validateForCosting(QuotationHeader $quotation): array
    {
        $errors = [];

        // Check quotation status
        if ($quotation->quote_status !== 'Draft') {
            $errors[] = 'Quotation must be in Draft status to prepare for costing';
        }

        // Check dimensions exist
        if ($quotation->dimensions()->count() === 0) {
            $errors[] = 'Quotation must have at least one dimension';
        }

        // Check totals are calculated
        if (! $quotation->total_chargeable_weight || $quotation->total_chargeable_weight <= 0) {
            $errors[] = 'Quotation totals are not properly calculated';
        }

        return $errors;
    }
}
