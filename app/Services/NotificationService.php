<?php

namespace App\Services;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\User;

class NotificationService
{
    public function send(
        User $user,
        NotificationType $type,
        string $subject,
        string $message,
        ?array $data = null,
        ?int $relatedId = null,
        ?string $relatedType = null,
    ): ?Notification {
        $preferences = $user->notificationPreferences ?? NotificationPreference::createDefaults($user->id);

        // Determine which channels to send through based on preferences
        $channels = $this->getChannelsForType($type, $preferences);

        if (empty($channels)) {
            return null;
        }

        $notification = null;

        foreach ($channels as $channel) {
            $notification = Notification::create([
                'user_id' => $user->id,
                'type' => $type,
                'channel' => $channel,
                'status' => NotificationStatus::Pending,
                'recipient_email' => $channel === NotificationChannel::Email ? $user->email : null,
                'recipient_phone' => $channel === NotificationChannel::SMS ? ($user->phone ?? null) : null,
                'subject' => $subject,
                'message' => $message,
                'data' => $data,
                'related_id' => $relatedId,
                'related_type' => $relatedType,
            ]);

            // Simulate sending based on channel
            $this->dispatchNotification($notification, $channel);
        }

        return $notification;
    }

    private function getChannelsForType(NotificationType $type, NotificationPreference $preferences): array
    {
        $channels = [];

        // Check email preferences
        $emailEnabled = match ($type) {
            NotificationType::ShipmentCreated => $preferences->email_shipment_created,
            NotificationType::ShipmentInTransit, NotificationType::ShipmentException => $preferences->email_shipment_updates,
            NotificationType::ShipmentDelivered => $preferences->email_delivery,
            NotificationType::OrderCreated, NotificationType::OrderConfirmed => $preferences->email_order_updates,
            NotificationType::InvoiceCreated, NotificationType::PaymentReceived, NotificationType::PaymentFailed => $preferences->email_payment_updates,
            default => true,
        };

        if ($emailEnabled) {
            $channels[] = NotificationChannel::Email;
        }

        // Check SMS preferences
        $smsEnabled = match ($type) {
            NotificationType::ShipmentCreated => $preferences->sms_shipment_created,
            NotificationType::ShipmentInTransit, NotificationType::ShipmentException => $preferences->sms_shipment_updates,
            NotificationType::ShipmentDelivered => $preferences->sms_delivery,
            default => false,
        };

        if ($smsEnabled) {
            $channels[] = NotificationChannel::SMS;
        }

        // Always add in-app if enabled
        if ($preferences->in_app_all) {
            $channels[] = NotificationChannel::InApp;
        }

        return $channels;
    }

    private function dispatchNotification(Notification $notification, NotificationChannel $channel): void
    {
        // Simulate sending
        $success = match ($channel) {
            NotificationChannel::Email => $this->sendEmail($notification),
            NotificationChannel::SMS => $this->sendSMS($notification),
            NotificationChannel::InApp => true, // In-app is always instant
        };

        if ($success) {
            $notification->markAsSent();
        } else {
            $notification->markAsFailed();
        }
    }

    private function sendEmail(Notification $notification): bool
    {
        // In production, use Laravel Mail facade
        // Mail::to($notification->recipient_email)->send(new NotificationMailable($notification));

        // Simulate 95% success rate
        return rand(1, 100) <= 95;
    }

    private function sendSMS(Notification $notification): bool
    {
        // In production, use SMS service like Twilio
        // SMS service send logic here

        // Simulate 90% success rate
        return rand(1, 100) <= 90;
    }

    public function getUnreadNotifications(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $user->notifications()
            ->where('status', '!=', NotificationStatus::Read)
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function clearNotifications(User $user, ?NotificationType $type = null): int
    {
        $query = $user->notifications();

        if ($type) {
            $query->where('type', $type);
        }

        return $query->delete();
    }
}
