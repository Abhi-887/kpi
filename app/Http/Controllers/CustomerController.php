<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\PaymentTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query()
            ->with('paymentTerm', 'addresses')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('type')) {
            $query->where('customer_type', $request->input('type'));
        }

        $customers = $query->paginate(15);

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create', [
            'paymentTerms' => PaymentTerm::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|unique:customers',
            'customer_type' => 'required|in:individual,business,corporate',
            'email' => 'required|email|unique:customers',
            'phone' => 'required|string',
            'secondary_phone' => 'nullable|string',
            'registration_number' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'payment_term_id' => 'nullable|exists:payment_terms,id',
            'credit_limit' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        Customer::create($validated);

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function show(Customer $customer)
    {
        $customer->load('addresses', 'paymentTerm');

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
            'paymentTerms' => PaymentTerm::where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'company_name' => "required|string|unique:customers,company_name,{$customer->id}",
            'customer_type' => 'required|in:individual,business,corporate',
            'email' => "required|email|unique:customers,email,{$customer->id}",
            'phone' => 'required|string',
            'secondary_phone' => 'nullable|string',
            'registration_number' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'payment_term_id' => 'nullable|exists:payment_terms,id',
            'credit_limit' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $customer->update($validated);

        return redirect()->route('customers.show', $customer)->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }
}
