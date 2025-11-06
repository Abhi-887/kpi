<?php

namespace App\Enums;

enum NotificationStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Failed = 'failed';
    case Bounced = 'bounced';
    case Read = 'read';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Sent => 'Sent',
            self::Failed => 'Failed',
            self::Bounced => 'Bounced',
            self::Read => 'Read',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'yellow',
            self::Sent => 'green',
            self::Failed => 'red',
            self::Bounced => 'orange',
            self::Read => 'blue',
        };
    }
}
