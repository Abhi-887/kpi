<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('category')->default('general');
            $table->string('type')->default('string'); // string, boolean, integer, json
            $table->text('description')->nullable();
        });

        // Seed default settings
        \App\Models\SystemSetting::create([
            'key' => 'app_name',
            'value' => 'KPI System',
            'category' => 'general',
            'type' => 'string',
            'description' => 'Application name displayed throughout the system',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'currency',
            'value' => 'USD',
            'category' => 'general',
            'type' => 'string',
            'description' => 'Default currency for the application',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'timezone',
            'value' => 'UTC',
            'category' => 'general',
            'type' => 'string',
            'description' => 'Server timezone',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'smtp_host',
            'value' => 'smtp.mailtrap.io',
            'category' => 'email',
            'type' => 'string',
            'description' => 'SMTP server host for email delivery',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'smtp_port',
            'value' => '465',
            'category' => 'email',
            'type' => 'integer',
            'description' => 'SMTP server port',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'notification_email',
            'value' => 'notifications@kpisystem.local',
            'category' => 'email',
            'type' => 'string',
            'description' => 'Email address for system notifications',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'default_shipping_carrier',
            'value' => 'fedex',
            'category' => 'shipping',
            'type' => 'string',
            'description' => 'Default carrier for shipping',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'enable_tracking',
            'value' => '1',
            'category' => 'shipping',
            'type' => 'boolean',
            'description' => 'Enable shipment tracking',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'default_payment_gateway',
            'value' => 'stripe',
            'category' => 'payment',
            'type' => 'string',
            'description' => 'Default payment gateway for invoices',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'enable_auto_invoicing',
            'value' => '1',
            'category' => 'payment',
            'type' => 'boolean',
            'description' => 'Automatically generate invoices for orders',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'invoice_due_days',
            'value' => '30',
            'category' => 'payment',
            'type' => 'integer',
            'description' => 'Number of days until invoice is due',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'enable_api_logging',
            'value' => '1',
            'category' => 'advanced',
            'type' => 'boolean',
            'description' => 'Enable logging of API requests and responses',
        ]);

        \App\Models\SystemSetting::create([
            'key' => 'max_file_upload_size',
            'value' => '10485760',
            'category' => 'advanced',
            'type' => 'integer',
            'description' => 'Maximum file upload size in bytes (default: 10MB)',
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
