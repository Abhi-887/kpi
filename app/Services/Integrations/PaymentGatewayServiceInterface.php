<?php

namespace App\Services\Integrations;

use App\Models\PaymentGatewayIntegration;

interface PaymentGatewayServiceInterface
{
    public function processPayment(float $amount, string $currency, string $description = ''): array;
    public function refundPayment(string $transactionId, float $amount = 0): array;
    public function getTransactionStatus(string $transactionId): array;
    public function testConnection(): bool;
}

abstract class BasePaymentGatewayService implements PaymentGatewayServiceInterface
{
    protected PaymentGatewayIntegration $integration;

    public function __construct(PaymentGatewayIntegration $integration)
    {
        $this->integration = $integration;
    }

    abstract public function processPayment(float $amount, string $currency, string $description = ''): array;
    abstract public function refundPayment(string $transactionId, float $amount = 0): array;
    abstract public function getTransactionStatus(string $transactionId): array;
    abstract public function testConnection(): bool;
}
