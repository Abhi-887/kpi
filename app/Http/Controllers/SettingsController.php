<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/Index', [
            'generalSettings' => SystemSetting::getByCategory('general'),
            'emailSettings' => SystemSetting::getByCategory('email'),
            'shippingSettings' => SystemSetting::getByCategory('shipping'),
            'paymentSettings' => SystemSetting::getByCategory('payment'),
            'advancedSettings' => SystemSetting::getByCategory('advanced'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'string|max:255',
            'currency' => 'string|max:3',
            'timezone' => 'string|timezone',
            'smtp_host' => 'string|max:255',
            'smtp_port' => 'integer|min:1|max:65535',
            'notification_email' => 'email',
            'default_shipping_carrier' => 'string|in:fedex,ups,dhl,usps',
            'enable_tracking' => 'boolean',
            'default_payment_gateway' => 'string|in:stripe,paypal,square,razorpay',
            'enable_auto_invoicing' => 'boolean',
            'invoice_due_days' => 'integer|min:1|max:365',
            'enable_api_logging' => 'boolean',
            'max_file_upload_size' => 'integer|min:1048576',
        ]);

        foreach ($validated as $key => $value) {
            $setting = SystemSetting::where('key', $key)->first();
            if ($setting) {
                SystemSetting::set(
                    $key,
                    $value,
                    $setting->category,
                    $setting->type,
                    $setting->description
                );
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    public function reset()
    {
        SystemSetting::truncate();

        // Reseed default settings
        $this->seedDefaults();

        return redirect()->back()->with('success', 'Settings reset to defaults.');
    }

    private function seedDefaults(): void
    {
        $defaults = [
            ['key' => 'app_name', 'value' => 'KPI System', 'category' => 'general', 'type' => 'string', 'description' => 'Application name'],
            ['key' => 'currency', 'value' => 'USD', 'category' => 'general', 'type' => 'string', 'description' => 'Default currency'],
            ['key' => 'timezone', 'value' => 'UTC', 'category' => 'general', 'type' => 'string', 'description' => 'Server timezone'],
            ['key' => 'smtp_host', 'value' => 'smtp.mailtrap.io', 'category' => 'email', 'type' => 'string', 'description' => 'SMTP host'],
            ['key' => 'smtp_port', 'value' => '465', 'category' => 'email', 'type' => 'integer', 'description' => 'SMTP port'],
            ['key' => 'notification_email', 'value' => 'notifications@kpisystem.local', 'category' => 'email', 'type' => 'string', 'description' => 'Notification email'],
            ['key' => 'default_shipping_carrier', 'value' => 'fedex', 'category' => 'shipping', 'type' => 'string', 'description' => 'Default carrier'],
            ['key' => 'enable_tracking', 'value' => '1', 'category' => 'shipping', 'type' => 'boolean', 'description' => 'Enable tracking'],
            ['key' => 'default_payment_gateway', 'value' => 'stripe', 'category' => 'payment', 'type' => 'string', 'description' => 'Default gateway'],
            ['key' => 'enable_auto_invoicing', 'value' => '1', 'category' => 'payment', 'type' => 'boolean', 'description' => 'Auto invoicing'],
            ['key' => 'invoice_due_days', 'value' => '30', 'category' => 'payment', 'type' => 'integer', 'description' => 'Due days'],
            ['key' => 'enable_api_logging', 'value' => '1', 'category' => 'advanced', 'type' => 'boolean', 'description' => 'API logging'],
            ['key' => 'max_file_upload_size', 'value' => '10485760', 'category' => 'advanced', 'type' => 'integer', 'description' => 'Max upload size'],
        ];

        foreach ($defaults as $default) {
            SystemSetting::create($default);
        }
    }
}
