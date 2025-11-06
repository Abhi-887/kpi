<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'customer_type',
        'registration_number',
        'tax_id',
        'primary_contact_name',
        'email',
        'phone',
        'secondary_phone',
        'website',
        'notes',
        'status',
        'payment_term_id',
        'credit_limit',
        'used_credit',
        'last_order_date',
        'total_orders',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'used_credit' => 'decimal:2',
            'last_order_date' => 'datetime',
        ];
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function paymentTerm(): BelongsTo
    {
        return $this->belongsTo(PaymentTerm::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function getAvailableCreditAttribute(): float
    {
        if (! $this->credit_limit) {
            return 0;
        }

        return (float) $this->credit_limit - (float) $this->used_credit;
    }
}
