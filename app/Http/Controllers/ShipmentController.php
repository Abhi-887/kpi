<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::query();

        // Search across multiple fields
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%")
                    ->orWhere('item_description', 'like', "%{$search}%")
                    ->orWhere('origin_city', 'like', "%{$search}%")
                    ->orWhere('destination_city', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by origin city
        if ($request->filled('origin_city')) {
            $query->where('origin_city', $request->input('origin_city'));
        }

        // Filter by destination city
        if ($request->filled('destination_city')) {
            $query->where('destination_city', $request->input('destination_city'));
        }

        // Filter by service type
        if ($request->filled('service_type')) {
            $query->where('service_type', $request->input('service_type'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = (int) $request->input('per_page', 50);
        $shipments = $query->paginate($perPage);

        return Inertia::render('Shipments/Index', [
            'shipments' => $shipments,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'origin_city' => $request->input('origin_city', ''),
                'destination_city' => $request->input('destination_city', ''),
                'service_type' => $request->input('service_type', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
            'origins' => Shipment::distinct()->pluck('origin_city')->sort(),
            'destinations' => Shipment::distinct()->pluck('destination_city')->sort(),
        ]);
    }

    public function show(Shipment $shipment)
    {
        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
        ]);
    }

    public function export(Request $request)
    {
        $query = Shipment::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%")
                    ->orWhere('item_description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $shipments = $query->get();

        $filename = 'shipments_'.now()->format('Y-m-d_H-i-s').'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $handle = fopen('php://memory', 'r+');
        fputcsv($handle, [
            'Tracking #', 'Reference #', 'Status', 'Origin', 'Destination',
            'Weight (kg)', 'Service Type', 'Carrier', 'Total Cost', 'Created At',
        ]);

        foreach ($shipments as $shipment) {
            fputcsv($handle, [
                $shipment->tracking_number,
                $shipment->reference_number,
                $shipment->status,
                $shipment->full_origin,
                $shipment->full_destination,
                $shipment->weight,
                $shipment->service_type,
                $shipment->carrier,
                $shipment->total_cost,
                $shipment->created_at->format('Y-m-d H:i:s'),
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, $headers);
    }
}
