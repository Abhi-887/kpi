<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGatewayIntegration extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'gateway_type',
        'public_key',
        'secret_key',
        'merchant_id',
        'settings',
        'is_active',
        'is_test_mode',
        'last_tested_at',
        'test_status',
        'test_message',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'json',
            'is_active' => 'boolean',
            'is_test_mode' => 'boolean',
            'last_tested_at' => 'datetime',
            'balance' => 'decimal:2',
            'public_key' => 'encrypted',
            'secret_key' => 'encrypted',
            'merchant_id' => 'encrypted',
        ];
    }

    public function getStatusBadgeAttribute(): string
    {
        if (!$this->is_active) {
            return 'Inactive';
        }

        return match ($this->test_status) {
            'success' => 'Connected',
            'failed' => 'Failed',
            default => 'Not Tested',
        };
    }
}
