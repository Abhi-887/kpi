<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'email_shipment_created',
        'email_shipment_updates',
        'email_delivery',
        'email_order_updates',
        'email_payment_updates',
        'sms_shipment_created',
        'sms_shipment_updates',
        'sms_delivery',
        'in_app_all',
        'notification_frequency',
        'digest_enabled',
    ];

    protected function casts(): array
    {
        return [
            'email_shipment_created' => 'boolean',
            'email_shipment_updates' => 'boolean',
            'email_delivery' => 'boolean',
            'email_order_updates' => 'boolean',
            'email_payment_updates' => 'boolean',
            'sms_shipment_created' => 'boolean',
            'sms_shipment_updates' => 'boolean',
            'sms_delivery' => 'boolean',
            'in_app_all' => 'boolean',
            'digest_enabled' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function createDefaults(int $userId): self
    {
        return self::create(['user_id' => $userId]);
    }
}
