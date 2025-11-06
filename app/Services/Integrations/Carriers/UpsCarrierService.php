<?php

namespace App\Services\Integrations\Carriers;

use App\Services\Integrations\BaseCarrierService;
use Carbon\Carbon;

class UpsCarrierService extends BaseCarrierService
{
    public function trackShipment(string $trackingNumber): array
    {
        // Simulate UPS tracking API
        $statuses = ['order_processed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
        $randomStatus = $statuses[array_rand($statuses)];

        return [
            'tracking_number' => $trackingNumber,
            'carrier' => 'UPS',
            'status' => $randomStatus,
            'current_location' => 'Atlanta, GA',
            'estimated_delivery' => Carbon::now()->addDays(1)->format('Y-m-d'),
            'events' => [
                [
                    'timestamp' => Carbon::now()->subHours(3)->format('Y-m-d H:i:s'),
                    'status' => 'Out for Delivery',
                    'location' => 'Atlanta, GA',
                    'description' => 'Out for delivery today',
                ],
            ],
        ];
    }

    public function calculateRate(array $shipmentData): float
    {
        // Simulate UPS rate calculation
        $weight = $shipmentData['weight'] ?? 1;
        $distance = $this->estimateDistance($shipmentData);
        
        $baseRate = 22.00;
        $perKgRate = 0.55;
        $distanceFactor = $distance > 1000 ? 0.018 : 0.009;
        
        return $baseRate + ($weight * $perKgRate) + ($distance * $distanceFactor);
    }

    public function createShipment(array $shipmentData): array
    {
        // Simulate UPS shipment creation
        $trackingNumber = '1Z' . strtoupper(bin2hex(random_bytes(8)));

        return [
            'success' => true,
            'tracking_number' => $trackingNumber,
            'carrier' => 'UPS',
            'label_url' => 'https://example.com/labels/' . $trackingNumber,
            'cost' => $this->calculateRate($shipmentData),
        ];
    }

    public function testConnection(): bool
    {
        // Simulate connection test
        return true;
    }

    private function estimateDistance(array $shipmentData): float
    {
        return rand(500, 3000);
    }
}
