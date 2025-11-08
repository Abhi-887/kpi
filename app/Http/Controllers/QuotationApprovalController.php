<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveQuotationRequest;
use App\Models\QuotationHeader;
use Inertia\Inertia;

class QuotationApprovalController extends Controller
{
    /**
     * Show approval dashboard (Module 23)
     */
    public function index()
    {
        $pendingApprovals = QuotationHeader::where('quote_status', 'pending_approval')
            ->with(['customer', 'salesperson', 'originPort', 'destinationPort', 'approval'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Quotations/ApprovalDashboard', [
            'pending_approvals' => $pendingApprovals,
        ]);
    }

    /**
     * Show single quotation for approval review
     */
    public function show(QuotationHeader $quotation)
    {
        if ($quotation->quote_status !== 'pending_approval') {
            return redirect()->route('quotations.approval.index')
                ->with('error', 'This quotation is not pending approval');
        }

        $quotation->load([
            'customer',
            'salesperson',
            'originPort',
            'destinationPort',
            'dimensions',
            'costLines.charge',
            'saleLines.charge',
            'approval.submittedBy',
            'approval.approver',
        ]);

        $summary = [
            'total_cost_inr' => $quotation->total_cost_inr,
            'total_sale_price_inr' => $quotation->total_sale_price_inr,
            'margin_percentage' => $quotation->margin_percentage,
            'margin_amount_inr' => $quotation->total_sale_price_inr - $quotation->total_cost_inr,
        ];

        return Inertia::render('Quotations/ApprovalReview', [
            'quotation' => $quotation,
            'summary' => $summary,
            'approval' => $quotation->approval,
        ]);
    }

    /**
     * Approve quotation (Module 23 action)
     */
    public function approve(QuotationHeader $quotation, ApproveQuotationRequest $request)
    {
        if ($quotation->quote_status !== 'pending_approval') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending approval quotations can be approved',
            ], 422);
        }

        try {
            $quotation->approval->approve(
                auth('web')->user(),
                $request->validated()['comments'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Quotation approved successfully',
                'redirect' => route('quotations.approval.index'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject quotation (Module 23 action)
     */
    public function reject(QuotationHeader $quotation, ApproveQuotationRequest $request)
    {
        if ($quotation->quote_status !== 'pending_approval') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending approval quotations can be rejected',
            ], 422);
        }

        $validated = $request->validated();

        if (! isset($validated['rejection_reason']) || blank($validated['rejection_reason'])) {
            return response()->json([
                'success' => false,
                'message' => 'Rejection reason is required',
            ], 422);
        }

        try {
            $quotation->approval->reject(
                auth('web')->user(),
                $validated['rejection_reason']
            );

            return response()->json([
                'success' => true,
                'message' => 'Quotation rejected successfully',
                'redirect' => route('quotations.approval.index'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
