<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $user->notifications()->where('status', '!=', 'read')->count(),
        ]);
    }

    public function preferences(Request $request)
    {
        $user = $request->user();
        $preferences = $user->notificationPreferences ?? NotificationPreference::createDefaults($user->id);

        return Inertia::render('Notifications/Preferences', [
            'preferences' => $preferences,
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $user = $request->user();
        $preferences = $user->notificationPreferences ?? NotificationPreference::createDefaults($user->id);

        $validated = $request->validate([
            'email_shipment_created' => 'boolean',
            'email_shipment_updates' => 'boolean',
            'email_delivery' => 'boolean',
            'email_order_updates' => 'boolean',
            'email_payment_updates' => 'boolean',
            'sms_shipment_created' => 'boolean',
            'sms_shipment_updates' => 'boolean',
            'sms_delivery' => 'boolean',
            'in_app_all' => 'boolean',
            'notification_frequency' => 'string|in:immediate,daily,weekly',
            'digest_enabled' => 'boolean',
        ]);

        $preferences->update($validated);

        return redirect()->back()->with('success', 'Notification preferences updated.');
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->markAsRead();

        return redirect()->back();
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $user->notifications()
            ->where('status', '!=', 'read')
            ->update(['status' => 'read', 'read_at' => now()]);

        return redirect()->back()->with('success', 'All notifications marked as read.');
    }

    public function clear(Request $request)
    {
        $user = $request->user();

        $user->notifications()->delete();

        return redirect()->back()->with('success', 'Notifications cleared.');
    }

    public function delete(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->delete();

        return redirect()->back()->with('success', 'Notification deleted.');
    }

    public function testNotification(Request $request)
    {
        $user = $request->user();

        $this->notificationService->send(
            $user,
            \App\Enums\NotificationType::SystemAlert,
            'Test Notification',
            'This is a test notification to verify your notification settings are working correctly.',
        );

        return redirect()->back()->with('success', 'Test notification sent!');
    }
}
