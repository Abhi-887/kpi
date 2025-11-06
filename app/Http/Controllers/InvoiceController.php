<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        $query = Invoice::query()
            ->with(['customer', 'order'])
            ->latest('invoice_date');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_status')) {
            $paymentStatus = $request->input('payment_status');
            if ($paymentStatus === 'unpaid') {
                $query->whereRaw('amount_paid = 0');
            } elseif ($paymentStatus === 'partially_paid') {
                $query->whereRaw('amount_paid > 0 AND amount_paid < total_amount');
            } elseif ($paymentStatus === 'paid') {
                $query->whereRaw('amount_paid >= total_amount');
            }
        }

        if ($request->filled('date_from')) {
            $query->whereDate('invoice_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('invoice_date', '<=', $request->input('date_to'));
        }

        $invoices = $query->paginate(15);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status', 'payment_status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create()
    {
        return Inertia::render('Invoices/Create', [
            'customers' => Customer::where('status', 'active')->get(),
            'orders' => Order::where('status', 'confirmed')->get(),
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_id' => 'nullable|exists:orders,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'currency' => 'required|in:USD,EUR,GBP,CAD,AUD,JPY,INR,MXN',
            'po_number' => 'nullable|string|max:50',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|in:bank_transfer,credit_card,check,wire',
        ]);

        $validated['status'] = 'draft';
        $validated['invoice_number'] = 'INV-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 10));
        $validated['subtotal'] = 0;
        $validated['tax_amount'] = 0;
        $validated['total_amount'] = 0;
        $validated['amount_paid'] = 0;

        $invoice = Invoice::create($validated);

        return redirect("/invoices/{$invoice->id}")->with('success', 'Invoice created successfully');
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'order', 'items']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing an invoice.
     */
    public function edit(Invoice $invoice)
    {
        $invoice->load(['customer', 'order', 'items']);

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => Customer::where('status', 'active')->get(),
            'orders' => Order::where('status', 'confirmed')->get(),
        ]);
    }

    /**
     * Update an invoice.
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_id' => 'nullable|exists:orders,id',
            'status' => 'required|in:draft,issued,sent,viewed,partially_paid,paid,overdue,cancelled',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'paid_date' => 'nullable|date',
            'currency' => 'required|in:USD,EUR,GBP,CAD,AUD,JPY,INR,MXN',
            'po_number' => 'nullable|string|max:50',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'amount_paid' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|in:bank_transfer,credit_card,check,wire',
            'reference_number' => 'nullable|string|max:100',
        ]);

        $invoice->update($validated);

        return redirect("/invoices/{$invoice->id}")->with('success', 'Invoice updated successfully');
    }

    /**
     * Delete an invoice.
     */
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return redirect('/invoices')->with('success', 'Invoice deleted successfully');
    }

    /**
     * Mark invoice as sent.
     */
    public function markAsSent(Invoice $invoice)
    {
        $invoice->update(['status' => 'sent']);

        return back()->with('success', 'Invoice marked as sent');
    }

    /**
     * Record payment for invoice.
     */
    public function recordPayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:bank_transfer,credit_card,check,wire',
            'reference_number' => 'nullable|string|max:100',
        ]);

        $newAmountPaid = (float) $invoice->amount_paid + (float) $validated['amount_paid'];
        
        $invoice->update([
            'amount_paid' => min($newAmountPaid, (float) $invoice->total_amount),
            'paid_date' => $validated['payment_date'],
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'],
            'status' => $newAmountPaid >= (float) $invoice->total_amount ? 'paid' : 'partially_paid',
        ]);

        return back()->with('success', 'Payment recorded successfully');
    }
}
