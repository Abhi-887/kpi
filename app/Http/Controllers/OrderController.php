<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::query()
            ->with('customer')
            ->latest('order_date');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('type')) {
            $query->where('order_type', $request->input('type'));
        }

        $orders = $query->paginate(15);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Orders/Create', [
            'customers' => Customer::where('status', 'active')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_type' => 'required|in:standard,express,ltl,fcl,lcl',
            'order_date' => 'required|date',
            'required_delivery_date' => 'nullable|date|after:order_date',
            'origin_country' => 'nullable|string|max:2',
            'destination_country' => 'nullable|string|max:2',
            'total_weight' => 'nullable|numeric|min:0',
            'weight_unit' => 'nullable|in:kg,lbs,tons',
            'notes' => 'nullable|string',
            'special_instructions' => 'nullable|string',
        ]);

        $validated['status'] = 'draft';
        $validated['order_number'] = 'ORD-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 10));
        $validated['subtotal'] = 0;
        $validated['tax'] = 0;
        $validated['shipping_cost'] = 0;
        $validated['total_amount'] = 0;

        $order = Order::create($validated);

        return redirect("/orders/{$order->id}")->with('success', 'Order created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['customer', 'items']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        $order->load('customer');

        return Inertia::render('Orders/Edit', [
            'order' => $order,
            'customers' => Customer::where('status', 'active')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_type' => 'required|in:standard,express,ltl,fcl,lcl',
            'status' => 'required|in:draft,pending,confirmed,shipped,delivered,cancelled',
            'order_date' => 'required|date',
            'required_delivery_date' => 'nullable|date|after:order_date',
            'actual_delivery_date' => 'nullable|date',
            'origin_country' => 'nullable|string|max:2',
            'destination_country' => 'nullable|string|max:2',
            'total_weight' => 'nullable|numeric|min:0',
            'weight_unit' => 'nullable|in:kg,lbs,tons',
            'notes' => 'nullable|string',
            'special_instructions' => 'nullable|string',
        ]);

        $order->update($validated);

        return redirect("/orders/{$order->id}")->with('success', 'Order updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return redirect('/orders')->with('success', 'Order deleted successfully');
    }
}
