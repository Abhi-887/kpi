<?php

namespace App\Services;

use App\Models\QuotationDimension;
use App\Models\QuotationHeader;
use Illuminate\Support\Facades\DB;

class QuotationBuilderService
{
    public function __construct(
        protected QuotationCreationService $quotationCreationService
    ) {}

    /**
     * Duplicate a quotation with all its dimensions
     * Used for quick quotation creation based on previous quotes (Module 22 feature)
     */
    public function duplicateQuotation(QuotationHeader $sourceQuotation): QuotationHeader
    {
        return DB::transaction(function () use ($sourceQuotation) {
            $sourceQuotation->load('dimensions');

            // Create new quotation with same attributes (except status and timestamps)
            $newQuotation = new QuotationHeader([
                'quote_status' => 'Draft',
                'created_by_user_id' => auth()->id() ?? $sourceQuotation->created_by_user_id,
                'salesperson_user_id' => $sourceQuotation->salesperson_user_id,
                'customer_id' => $sourceQuotation->customer_id,
                'mode' => $sourceQuotation->mode,
                'movement' => $sourceQuotation->movement,
                'terms' => $sourceQuotation->terms,
                'origin_port_id' => $sourceQuotation->origin_port_id,
                'destination_port_id' => $sourceQuotation->destination_port_id,
                'origin_location_id' => $sourceQuotation->origin_location_id,
                'destination_location_id' => $sourceQuotation->destination_location_id,
                'notes' => $sourceQuotation->notes ? $sourceQuotation->notes.' (Duplicated)' : 'Duplicated from '.$sourceQuotation->quote_id,
            ]);

            // Generate new quote_id
            $newQuotation->quote_id = $newQuotation->generateQuoteId();
            $newQuotation->save();

            // Duplicate all dimensions
            foreach ($sourceQuotation->dimensions()->ordered()->get() as $sourceDim) {
                QuotationDimension::create([
                    'quotation_header_id' => $newQuotation->id,
                    'length_cm' => $sourceDim->length_cm,
                    'width_cm' => $sourceDim->width_cm,
                    'height_cm' => $sourceDim->height_cm,
                    'pieces' => $sourceDim->pieces,
                    'actual_weight_per_piece_kg' => $sourceDim->actual_weight_per_piece_kg,
                    'sequence' => $sourceDim->sequence,
                ]);
            }

            // Recalculate totals
            $this->quotationCreationService->recalculateTotals($newQuotation);

            return $newQuotation->refresh();
        });
    }

    /**
     * Convert a quotation to an order (after approval)
     * Used in Module 22 - transitions from quotation to order
     */
    public function convertQuotationToOrder(QuotationHeader $quotation)
    {
        if ($quotation->quote_status !== 'Sent' && $quotation->quote_status !== 'Won') {
            throw new \Exception('Only Sent or Won quotations can be converted to orders');
        }

        // This will be implemented when connecting to Order module
        // For now, just mark as Won
        $quotation->update(['quote_status' => 'Won']);

        return $quotation;
    }

    /**
     * Export quotation to CSV (for Module 22 dashboard)
     * Can be used for bulk operations or reporting
     */
    public function exportQuotationToCsv(QuotationHeader $quotation): string
    {
        $quotation->load('customer', 'originPort', 'destinationPort', 'dimensions');

        $csv = "Quote ID,{$quotation->quote_id}\n";
        $csv .= "Customer,{$quotation->customer->company_name}\n";
        $csv .= "Status,{$quotation->quote_status}\n";
        $csv .= "Mode,{$quotation->mode}\n";
        $csv .= "Movement,{$quotation->movement}\n";
        $csv .= "Terms,{$quotation->terms}\n";
        $csv .= "Origin Port,{$quotation->originPort->name}\n";
        $csv .= "Destination Port,{$quotation->destinationPort->name}\n";
        $csv .= "Total Weight (kg),{$quotation->total_actual_weight}\n";
        $csv .= "Total CBM,{$quotation->total_cbm}\n";
        $csv .= "Total Pieces,{$quotation->total_pieces}\n";
        $csv .= "Chargeable Weight,{$quotation->total_chargeable_weight}\n";
        $csv .= "\nDimensions\n";
        $csv .= "Length (cm),Width (cm),Height (cm),Pieces,Weight per Piece (kg),Total Weight (kg),CBM\n";

        foreach ($quotation->dimensions()->ordered()->get() as $dim) {
            $csv .= "{$dim->length_cm},{$dim->width_cm},{$dim->height_cm},{$dim->pieces},{$dim->actual_weight_per_piece_kg},{$dim->total_weight_for_row_kg},{$dim->total_cbm_for_row}\n";
        }

        return $csv;
    }

    /**
     * Calculate quotation summary stats
     * Used for dashboard/reporting
     */
    public function getQuotationStats(QuotationHeader $quotation): array
    {
        $costLines = $quotation->costLines()->with('charge')->get();

        return [
            'quote_id' => $quotation->quote_id,
            'status' => $quotation->quote_status,
            'customer' => $quotation->customer->company_name,
            'created_ago' => $quotation->created_at->diffForHumans(),
            'dimensions_count' => $quotation->dimensions()->count(),
            'total_weight' => (float) $quotation->total_actual_weight,
            'total_cbm' => (float) $quotation->total_cbm,
            'total_pieces' => $quotation->total_pieces,
            'charges_count' => $costLines->count(),
            'total_cost' => (float) $costLines->sum('total_cost_inr'),
            'cost_per_kg' => $quotation->total_actual_weight > 0
                ? round((float) $costLines->sum('total_cost_inr') / (float) $quotation->total_actual_weight, 2)
                : 0,
        ];
    }
}
