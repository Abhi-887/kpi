<?php

namespace App\Services\Integrations;

use App\Models\CarrierIntegration;

interface CarrierServiceInterface
{
    public function trackShipment(string $trackingNumber): array;
    public function calculateRate(array $shipmentData): float;
    public function createShipment(array $shipmentData): array;
    public function testConnection(): bool;
}

abstract class BaseCarrierService implements CarrierServiceInterface
{
    protected CarrierIntegration $integration;

    public function __construct(CarrierIntegration $integration)
    {
        $this->integration = $integration;
    }

    abstract public function trackShipment(string $trackingNumber): array;
    abstract public function calculateRate(array $shipmentData): float;
    abstract public function createShipment(array $shipmentData): array;
    abstract public function testConnection(): bool;
}
