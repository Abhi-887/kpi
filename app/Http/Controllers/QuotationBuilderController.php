<?php

namespace App\Http\Controllers;

use App\Models\QuotationHeader;
use App\Services\QuotationBuilderService;
use Illuminate\Http\JsonResponse;
use Inertia\Response;

class QuotationBuilderController extends Controller
{
    public function __construct(
        protected QuotationBuilderService $builderService
    ) {}

    /**
     * Show the quotation builder page with sale lines
     */
    public function show(QuotationHeader $quotation): Response
    {
        // Verify quotation is in correct status for building
        if (! in_array($quotation->quote_status, ['Pending Approval', 'Draft'])) {
            abort(403, 'Quotation must be in Pending Approval or Draft status to build');
        }

        // Build sale lines if they don't exist yet
        if ($quotation->saleLines()->count() === 0) {
            $this->builderService->buildSaleLinesFromCosts($quotation);
        }

        // Get grid data for rendering
        $gridData = $this->builderService->getBuilderGridData($quotation);

        return inertia('Quotations/Builder', [
            'quotation' => $quotation->load(['customer', 'salesperson', 'saleLines.charge']),
            'gridData' => $gridData,
        ]);
    }

    /**
     * Update sale price for a line item (margin override)
     */
    public function updateSalePrice(QuotationHeader $quotation, int $saleLineId): JsonResponse
    {
        $validated = request()->validate([
            'new_sale_price' => 'required|numeric|min:0',
        ]);

        try {
            $this->builderService->updateSalePriceOverride(
                $quotation,
                $saleLineId,
                (float) $validated['new_sale_price']
            );

            return response()->json([
                'success' => true,
                'message' => 'Sale price updated successfully',
                'gridData' => $this->builderService->getBuilderGridData($quotation),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Finalize sale lines and move to "Sent" status
     */
    public function finalize(QuotationHeader $quotation): JsonResponse
    {
        try {
            $updated = $this->builderService->finalizeSaleLines($quotation);

            return response()->json([
                'success' => true,
                'message' => 'Quotation finalized and sent successfully',
                'quotation' => $updated,
                'redirect' => route('quotations.show', $updated),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
