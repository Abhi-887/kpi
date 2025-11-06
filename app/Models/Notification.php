<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'status',
        'recipient_email',
        'recipient_phone',
        'subject',
        'message',
        'data',
        'related_id',
        'related_type',
        'sent_at',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => NotificationType::class,
            'channel' => NotificationChannel::class,
            'status' => NotificationStatus::class,
            'data' => 'json',
            'sent_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsSent(): void
    {
        $this->update([
            'status' => NotificationStatus::Sent,
            'sent_at' => now(),
        ]);
    }

    public function markAsRead(): void
    {
        $this->update([
            'status' => NotificationStatus::Read,
            'read_at' => now(),
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => NotificationStatus::Failed]);
    }
}
