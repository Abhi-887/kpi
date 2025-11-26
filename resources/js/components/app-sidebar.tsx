import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData, type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, DollarSign, FileText, Users, ShoppingCart, Receipt, Bell, Zap, Settings, History, TrendingUp, Layers, Database, Tag, MapPin, Calculator, Percent } from 'lucide-react';
import AppLogo from './app-logo';
import React, { useEffect, useRef, useMemo } from 'react';

// Extended NavItem with role permissions
interface NavItemWithRoles extends NavItem {
    allowedRoles?: string[];
    children?: NavItemWithRoles[];
}

interface NavGroupWithRoles {
    title: string;
    items: NavItemWithRoles[];
    allowedRoles?: string[];
}

// All roles for reference
const ALL_ROLES = ['super_admin', 'admin', 'customer', 'vendor', 'supplier', 'purchase'];
const ADMIN_ROLES = ['super_admin', 'admin'];
const INTERNAL_ROLES = ['super_admin', 'admin', 'purchase'];

const navGroupsConfig: NavGroupWithRoles[] = [
    // {
    //     title: 'Overview',
    //     items: [
    //         { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    //     ],
    // },
    {
        title: 'Master Data',
        allowedRoles: INTERNAL_ROLES, // Only super_admin, admin, purchase can see Master Data
        items: [
            { title: 'Items', href: '/items', icon: Database, allowedRoles: INTERNAL_ROLES },
            { title: 'Unit of Measures', href: '/unit-of-measures', icon: Layers, allowedRoles: ADMIN_ROLES },
            { title: 'Tax Codes', href: '/tax-codes', icon: Receipt, allowedRoles: ADMIN_ROLES },
            { title: 'Charges', href: '/charges', icon: Tag, allowedRoles: ADMIN_ROLES },
            { title: 'Container Types', href: '/container-types', icon: Layers, allowedRoles: ADMIN_ROLES },
            { title: 'Ports', href: '/ports', icon: MapPin, allowedRoles: INTERNAL_ROLES },
            { title: 'Suppliers', href: '/suppliers', icon: Users, allowedRoles: ['super_admin', 'admin', 'purchase', 'supplier'] },
            { title: 'Customers', href: '/customers', icon: Users, allowedRoles: ADMIN_ROLES },
        ],
    },
    // {
    //     title: 'Pricing',
    //     items: [
    //         { title: 'Price Lists', href: '/price-lists', icon: Tag },
    //         { title: 'Rate Cards', href: '/vendor-rates', icon: DollarSign },
    //         { title: 'Exchange Rates', href: '/exchange-rates', icon: TrendingUp },
    //         { title: 'Charge Applicability', href: '/charge-applicability', icon: Zap },
    //         { title: 'Margin Engine', href: '/margin-engine', icon: TrendingUp },
    //         { title: 'Formula Engine', href: '/formula-engine', icon: Calculator },
    //         { title: 'Tax Calculation Engine', href: '/tax-engine', icon: Percent },
    //         {
    //             title: 'Pricing Tables',
    //             href: '/pricing',
    //             icon: DollarSign,
    //             children: [
    //                 { title: 'Packaging Prices', href: '/packaging-prices', icon: DollarSign },
    //                 { title: 'Courier Prices', href: '/courier-prices', icon: DollarSign },
    //                 { title: 'Forwarding Prices', href: '/forwarding-prices', icon: DollarSign },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     title: 'Sales & Operations',
    //     items: [
    //         {
    //             title: 'Quotations',
    //             href: '/quotations',
    //             icon: FileText,
    //             children: [
    //                 { title: 'All Quotations', href: '/quotations', icon: FileText },
    //                 { title: 'Create New', href: '/quotations/create', icon: FileText },
    //                 { title: 'Pending Approval', href: '/quotations-approval', icon: FileText },
    //             ],
    //         },
    //         { title: 'Orders', href: '/orders', icon: ShoppingCart },
    //         { title: 'Shipments', href: '/shipments', icon: Package },
    //         { title: 'Invoices', href: '/invoices', icon: Receipt },
    //     ],
    // },
    // {
    //     title: 'Integrations',
    //     items: [
    //         {
    //             title: 'Integrations',
    //             href: '/integrations',
    //             icon: Zap,
    //             children: [
    //                 { title: 'Carriers', href: '/integrations/carriers', icon: Package },
    //                 { title: 'Payment Gateways', href: '/integrations/payment-gateways', icon: DollarSign },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     title: 'Analytics',
    //     items: [
    //         { title: 'Price Comparison', href: '/price-comparisons', icon: TrendingUp },
    //     ],
    // },
    {
        title: 'Monitoring',
        allowedRoles: ALL_ROLES,
        items: [
            { title: 'Notifications', href: '/notifications', icon: Bell },
            // { title: 'Audit Logs', href: '/audit-logs', icon: History },
        ],
    },
    {
        title: 'Administration',
        allowedRoles: ADMIN_ROLES, // Only super_admin and admin
        items: [
            { title: 'Settings', href: '/admin/settings', icon: Settings, allowedRoles: ADMIN_ROLES },
        ],
    },
];

const footerNavItems: NavItem[] = [];

// Helper function to filter items by role
function filterItemsByRole(items: NavItemWithRoles[], userRole: string): NavItem[] {
    return items
        .filter((item) => {
            // If no allowedRoles specified, show to everyone
            if (!item.allowedRoles || item.allowedRoles.length === 0) {
                return true;
            }
            return item.allowedRoles.includes(userRole);
        })
        .map((item) => {
            const { allowedRoles, children, ...rest } = item;
            return {
                ...rest,
                children: children ? filterItemsByRole(children, userRole) : undefined,
            } as NavItem;
        });
}

// Helper function to filter groups by role
function filterGroupsByRole(groups: NavGroupWithRoles[], userRole: string): NavGroup[] {
    return groups
        .filter((group) => {
            // If no allowedRoles specified, show to everyone
            if (!group.allowedRoles || group.allowedRoles.length === 0) {
                return true;
            }
            return group.allowedRoles.includes(userRole);
        })
        .map((group) => ({
            title: group.title,
            items: filterItemsByRole(group.items, userRole),
        }))
        .filter((group) => group.items.length > 0); // Remove empty groups
}

export function AppSidebar() {
    const SCROLL_KEY = 'sidebar_scroll_top';
    const contentRef = useRef<HTMLDivElement | null>(null);
    const { auth } = usePage<SharedData>().props;
    const userRole = (auth?.user as any)?.role_slug || 'customer';

    // Filter navigation groups based on user role
    const navGroups = useMemo(() => {
        return filterGroupsByRole(navGroupsConfig, userRole);
    }, [userRole]);

    useEffect(() => {
        try {
            const saved = Number(localStorage.getItem(SCROLL_KEY) ?? '0');
            if (contentRef.current) {
                contentRef.current.scrollTop = saved;
            }
        } catch {
            // ignore
        }
    }, []);

    const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
        try {
            const top = (e.currentTarget as HTMLDivElement).scrollTop;
            localStorage.setItem(SCROLL_KEY, String(top));
        } catch {
            // ignore
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent ref={contentRef} onScroll={handleScroll}>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                {footerNavItems.length > 0 && (
                    <NavFooter items={footerNavItems} className="mt-auto" />
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
