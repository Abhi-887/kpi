<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarrierIntegration extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'carrier_type',
        'api_key',
        'api_secret',
        'account_number',
        'settings',
        'is_active',
        'is_test_mode',
        'last_tested_at',
        'test_status',
        'test_message',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'json',
            'is_active' => 'boolean',
            'is_test_mode' => 'boolean',
            'last_tested_at' => 'datetime',
            'api_key' => 'encrypted',
            'api_secret' => 'encrypted',
            'account_number' => 'encrypted',
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
