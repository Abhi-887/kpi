<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'supplier_id',
        'name',
        'contact_person',
        'email',
        'phone',
        'company',
        'gst_vat_number',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'payment_terms',
        'lead_time_days',
        'preferred_currency',
        'rating_score',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'lead_time_days' => 'integer',
            'rating_score' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function costComponents(): HasMany
    {
        return $this->hasMany(CostComponent::class);
    }
}
