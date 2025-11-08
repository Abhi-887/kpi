<?php

namespace App\Enums;

enum QuotationStatus: string
{
    case Draft = 'draft';
    case PendingCosting = 'pending_costing';
    case PendingApproval = 'pending_approval';
    case Sent = 'sent';
    case Won = 'won';
    case Lost = 'lost';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::PendingCosting => 'Pending Costing',
            self::PendingApproval => 'Pending Approval',
            self::Sent => 'Sent',
            self::Won => 'Won',
            self::Lost => 'Lost',
            self::Cancelled => 'Cancelled',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Draft => 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            self::PendingCosting => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            self::PendingApproval => 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            self::Sent => 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            self::Won => 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            self::Lost => 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            self::Cancelled => 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Draft => 'file-text',
            self::PendingCosting => 'loader',
            self::PendingApproval => 'check-square',
            self::Sent => 'send',
            self::Won => 'check-circle',
            self::Lost => 'x-circle',
            self::Cancelled => 'slash-circle',
        };
    }
}
