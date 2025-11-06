<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date')) : now()->subMonths(3);
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date')) : now();

        // Shipment Statistics
        $totalShipments = Shipment::whereBetween('created_at', [$startDate, $endDate])->count();
        $deliveredShipments = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'delivered')
            ->count();
        $pendingShipments = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['pending', 'in_transit'])
            ->count();

        $shipmentDeliveryRate = $totalShipments > 0 ? ($deliveredShipments / $totalShipments) * 100 : 0;

        // Revenue Statistics
        $totalRevenue = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');
        $paidRevenue = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount_paid');
        $pendingRevenue = $totalRevenue - $paidRevenue;

        $collectionRate = $totalRevenue > 0 ? ($paidRevenue / $totalRevenue) * 100 : 0;

        // Order Statistics
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        // Customer Statistics
        $totalCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])->count();
        $newCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])->count();

        // Shipment Volume by Status
        $shipmentsByStatus = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Revenue by Month
        $revenueByMonth = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total_amount) as amount')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('amount', 'month');

        // Top Customers by Revenue
        $topCustomers = Customer::query()
            ->selectRaw('customers.id, customers.company_name, customers.email, SUM(COALESCE(invoices.total_amount, 0)) as total_revenue')
            ->leftJoin('invoices', 'customers.id', '=', 'invoices.customer_id')
            ->whereBetween('invoices.created_at', [$startDate, $endDate])
            ->groupBy('customers.id', 'customers.company_name', 'customers.email')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        // Invoice Status Distribution
        $invoicesByStatus = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Average Order Value
        $averageOrderValue = $totalOrders > 0 ? ($totalRevenue / $totalOrders) : 0;

        // Average Shipment Cost
        $averageShipmentCost = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->avg('base_freight') ?? 0;

        return Inertia::render('Dashboard/Index', [
            'metrics' => [
                'totalShipments' => (int) $totalShipments,
                'deliveredShipments' => (int) $deliveredShipments,
                'pendingShipments' => (int) $pendingShipments,
                'shipmentDeliveryRate' => round($shipmentDeliveryRate, 2),
                'totalRevenue' => round($totalRevenue, 2),
                'paidRevenue' => round($paidRevenue, 2),
                'pendingRevenue' => round($pendingRevenue, 2),
                'collectionRate' => round($collectionRate, 2),
                'totalOrders' => (int) $totalOrders,
                'completedOrders' => (int) $completedOrders,
                'totalCustomers' => (int) $totalCustomers,
                'newCustomers' => (int) $newCustomers,
                'averageOrderValue' => round($averageOrderValue, 2),
                'averageShipmentCost' => round($averageShipmentCost, 2),
            ],
            'charts' => [
                'shipmentsByStatus' => $shipmentsByStatus->map(fn ($count, $status) => [
                    'name' => ucfirst(str_replace('_', ' ', $status)),
                    'value' => $count,
                ])->values(),
                'revenueByMonth' => $revenueByMonth->map(fn ($amount, $month) => [
                    'month' => $month,
                    'amount' => round($amount, 2),
                ])->values(),
                'invoicesByStatus' => $invoicesByStatus->map(fn ($count, $status) => [
                    'name' => ucfirst(str_replace('_', ' ', $status)),
                    'value' => $count,
                ])->values(),
            ],
            'topCustomers' => $topCustomers->map(fn ($customer) => [
                'id' => $customer->id,
                'company_name' => $customer->company_name,
                'contact_email' => $customer->email,
                'total_revenue' => (float) ($customer->total_revenue ?? 0),
            ]),
            'dateRange' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
