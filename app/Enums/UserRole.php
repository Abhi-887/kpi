<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case CUSTOMER = 'customer';
    case VENDOR = 'vendor';
    case SUPPLIER = 'supplier';
    case PURCHASE = 'purchase';

    /**
     * Get the display name for the role
     */
    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN => 'Admin',
            self::CUSTOMER => 'Customer',
            self::VENDOR => 'Vendor',
            self::SUPPLIER => 'Supplier',
            self::PURCHASE => 'Purchase Manager',
        };
    }

    /**
     * Get the brand color for the role (Tailwind color)
     */
    public function color(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'violet',      // Violet for Super Admin
            self::ADMIN => 'slate',              // Slate for Admin
            self::CUSTOMER => 'blue',            // Blue for Customer
            self::VENDOR => 'amber',             // Amber for Vendor
            self::SUPPLIER => 'emerald',         // Emerald for Supplier
            self::PURCHASE => 'orange',          // Orange for Purchase Manager
        };
    }

    /**
     * Get the hex color for the role
     */
    public function hexColor(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => '#7c3aed',     // violet-600
            self::ADMIN => '#64748b',            // slate-600
            self::CUSTOMER => '#3b82f6',         // blue-600
            self::VENDOR => '#d97706',           // amber-600
            self::SUPPLIER => '#10b981',         // emerald-600
            self::PURCHASE => '#ea580c',         // orange-600
        };
    }

    /**
     * Get all available roles
     */
    public static function all(): array
    {
        return [
            self::SUPER_ADMIN,
            self::ADMIN,
            self::CUSTOMER,
            self::VENDOR,
            self::SUPPLIER,
            self::PURCHASE,
        ];
    }

    /**
     * Check if role is admin-like (Super Admin or Admin)
     */
    public function isAdmin(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN]);
    }

    /**
     * Check if role is vendor-like
     */
    public function isVendor(): bool
    {
        return $this === self::VENDOR;
    }

    /**
     * Check if role is customer-like
     */
    public function isCustomer(): bool
    {
        return $this === self::CUSTOMER;
    }
}
