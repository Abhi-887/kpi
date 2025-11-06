<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case Email = 'email';
    case SMS = 'sms';
    case InApp = 'in_app';

    public function label(): string
    {
        return match ($this) {
            self::Email => 'Email',
            self::SMS => 'SMS',
            self::InApp => 'In-App',
        };
    }
}
