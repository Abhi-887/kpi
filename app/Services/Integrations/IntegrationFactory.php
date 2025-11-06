<?php

namespace App\Services\Integrations;

use App\Models\CarrierIntegration;
use App\Models\PaymentGatewayIntegration;
use App\Services\Integrations\Carriers\FedexCarrierService;
use App\Services\Integrations\Carriers\UpsCarrierService;
use App\Services\Integrations\Carriers\DhlCarrierService;
use App\Services\Integrations\PaymentGateways\StripePaymentService;
use App\Services\Integrations\PaymentGateways\PaypalPaymentService;

class IntegrationFactory
{
    public static function getCarrierService(CarrierIntegration $integration): CarrierServiceInterface
    {
        return match ($integration->carrier_type) {
            'fedex' => new FedexCarrierService($integration),
            'ups' => new UpsCarrierService($integration),
            'dhl' => new DhlCarrierService($integration),
            default => throw new \Exception('Unknown carrier type: ' . $integration->carrier_type),
        };
    }

    public static function getPaymentService(PaymentGatewayIntegration $integration): PaymentGatewayServiceInterface
    {
        return match ($integration->gateway_type) {
            'stripe' => new StripePaymentService($integration),
            'paypal' => new PaypalPaymentService($integration),
            default => throw new \Exception('Unknown gateway type: ' . $integration->gateway_type),
        };
    }
}
