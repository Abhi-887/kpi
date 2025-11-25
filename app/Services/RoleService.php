<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;

class RoleService
{
    /**
     * Get the role configuration with colors and display info
     */
    public static function getRoleConfig(UserRole|string $role): array
    {
        if (is_string($role)) {
            $role = UserRole::tryFrom($role) ?? UserRole::CUSTOMER;
        }

        return [
            'slug' => $role->value,
            'label' => $role->label(),
            'color' => $role->color(),
            'hexColor' => $role->hexColor(),
            'isAdmin' => $role->isAdmin(),
            'isVendor' => $role->isVendor(),
            'isCustomer' => $role->isCustomer(),
        ];
    }

    /**
     * Get login page configuration for a specific role
     */
    public static function getLoginConfig(UserRole|string $role): array
    {
        $config = self::getRoleConfig($role);

        return array_merge($config, [
            'title' => "Log in to {$config['label']} Dashboard",
            'description' => "Enter your credentials to access your {$config['label']} account",
            'logoText' => $config['label'],
        ]);
    }

    /**
     * Determine redirect path after login based on user role
     */
    public static function getRedirectPath(User $user): string
    {
        return match ($user->role()) {
            UserRole::SUPER_ADMIN => '/dashboard?view=admin',
            UserRole::ADMIN => '/dashboard?view=admin',
            UserRole::CUSTOMER => '/dashboard?view=customer',
            UserRole::VENDOR => '/dashboard?view=vendor',
            UserRole::SUPPLIER => '/dashboard?view=supplier',
            UserRole::PURCHASE => '/dashboard?view=purchase',
            default => '/dashboard',
        };
    }

    /**
     * Get accessible menu items for a role
     */
    public static function getMenuItems(UserRole|string $role): array
    {
        $roleEnum = is_string($role) ? UserRole::tryFrom($role) ?? UserRole::CUSTOMER : $role;

        return match ($roleEnum) {
            UserRole::SUPER_ADMIN => [
                ['label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutDashboard'],
                ['label' => 'Users', 'href' => '/users', 'icon' => 'Users'],
                ['label' => 'Roles', 'href' => '/roles', 'icon' => 'Lock'],
                ['label' => 'Audit Logs', 'href' => '/audit-logs', 'icon' => 'FileText'],
                ['label' => 'Settings', 'href' => '/settings', 'icon' => 'Settings'],
            ],
            UserRole::ADMIN => [
                ['label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutDashboard'],
                ['label' => 'Quotations', 'href' => '/quotations', 'icon' => 'FileText'],
                ['label' => 'Shipments', 'href' => '/shipments', 'icon' => 'Package'],
                ['label' => 'Orders', 'href' => '/orders', 'icon' => 'ShoppingCart'],
                ['label' => 'Customers', 'href' => '/customers', 'icon' => 'Users'],
                ['label' => 'Invoices', 'href' => '/invoices', 'icon' => 'FileText'],
                ['label' => 'Settings', 'href' => '/settings', 'icon' => 'Settings'],
            ],
            UserRole::CUSTOMER => [
                ['label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutDashboard'],
                ['label' => 'Orders', 'href' => '/orders', 'icon' => 'ShoppingCart'],
                ['label' => 'Shipments', 'href' => '/shipments', 'icon' => 'Package'],
                ['label' => 'Invoices', 'href' => '/invoices', 'icon' => 'FileText'],
                ['label' => 'Profile', 'href' => '/profile', 'icon' => 'User'],
            ],
            UserRole::VENDOR => [
                ['label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutDashboard'],
                ['label' => 'Rate Cards', 'href' => '/rate-cards', 'icon' => 'BarChart3'],
                ['label' => 'Quotations', 'href' => '/quotations', 'icon' => 'FileText'],
                ['label' => 'Shipments', 'href' => '/shipments', 'icon' => 'Package'],
                ['label' => 'Profile', 'href' => '/profile', 'icon' => 'User'],
            ],
            UserRole::SUPPLIER => [
                ['label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutDashboard'],
                ['label' => 'Inventory', 'href' => '/inventory', 'icon' => 'Package'],
                ['label' => 'Orders', 'href' => '/orders', 'icon' => 'ShoppingCart'],
                ['label' => 'Suppliers', 'href' => '/suppliers', 'icon' => 'Users'],
                ['label' => 'Profile', 'href' => '/profile', 'icon' => 'User'],
            ],
            UserRole::PURCHASE => [
                ['label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutDashboard'],
                ['label' => 'Purchase Orders', 'href' => '/purchase-orders', 'icon' => 'ShoppingCart'],
                ['label' => 'Suppliers', 'href' => '/suppliers', 'icon' => 'Users'],
                ['label' => 'Invoices', 'href' => '/invoices', 'icon' => 'FileText'],
                ['label' => 'Profile', 'href' => '/profile', 'icon' => 'User'],
            ],
            default => [],
        };
    }
}
