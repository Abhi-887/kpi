<?php

namespace App\Enums;

enum NotificationType: string
{
    case ShipmentCreated = 'shipment_created';
    case ShipmentInTransit = 'shipment_in_transit';
    case ShipmentDelivered = 'shipment_delivered';
    case ShipmentException = 'shipment_exception';
    case OrderCreated = 'order_created';
    case OrderConfirmed = 'order_confirmed';
    case InvoiceCreated = 'invoice_created';
    case PaymentReceived = 'payment_received';
    case PaymentFailed = 'payment_failed';
    case SystemAlert = 'system_alert';

    public function label(): string
    {
        return match ($this) {
            self::ShipmentCreated => 'Shipment Created',
            self::ShipmentInTransit => 'Shipment In Transit',
            self::ShipmentDelivered => 'Shipment Delivered',
            self::ShipmentException => 'Shipment Exception',
            self::OrderCreated => 'Order Created',
            self::OrderConfirmed => 'Order Confirmed',
            self::InvoiceCreated => 'Invoice Created',
            self::PaymentReceived => 'Payment Received',
            self::PaymentFailed => 'Payment Failed',
            self::SystemAlert => 'System Alert',
        };
    }
}
