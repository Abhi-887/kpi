// Role menu configuration for TypeScript
export const roleMenuConfig: Record<string, any> = {
    super_admin: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Users', href: '/users', icon: 'Users' },
        { label: 'Roles', href: '/roles', icon: 'Lock' },
        { label: 'Audit Logs', href: '/audit-logs', icon: 'FileText' },
        { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
    admin: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Quotations', href: '/quotations', icon: 'FileText' },
        { label: 'Shipments', href: '/shipments', icon: 'Package' },
        { label: 'Orders', href: '/orders', icon: 'ShoppingCart' },
        { label: 'Customers', href: '/customers', icon: 'Users' },
        { label: 'Invoices', href: '/invoices', icon: 'FileText' },
        { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
    customer: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Orders', href: '/orders', icon: 'ShoppingCart' },
        { label: 'Shipments', href: '/shipments', icon: 'Package' },
        { label: 'Invoices', href: '/invoices', icon: 'FileText' },
        { label: 'Profile', href: '/profile', icon: 'User' },
    ],
    vendor: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Rate Cards', href: '/rate-cards', icon: 'BarChart3' },
        { label: 'Quotations', href: '/quotations', icon: 'FileText' },
        { label: 'Shipments', href: '/shipments', icon: 'Package' },
        { label: 'Profile', href: '/profile', icon: 'User' },
    ],
    supplier: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Inventory', href: '/inventory', icon: 'Package' },
        { label: 'Orders', href: '/orders', icon: 'ShoppingCart' },
        { label: 'Suppliers', href: '/suppliers', icon: 'Users' },
        { label: 'Profile', href: '/profile', icon: 'User' },
    ],
    purchase: [
        { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Purchase Orders', href: '/purchase-orders', icon: 'ShoppingCart' },
        { label: 'Suppliers', href: '/suppliers', icon: 'Users' },
        { label: 'Invoices', href: '/invoices', icon: 'FileText' },
        { label: 'Profile', href: '/profile', icon: 'User' },
    ],
};

export function getMenuItemsForRole(roleSlug: string): any[] {
    return roleMenuConfig[roleSlug] || roleMenuConfig.customer;
}
