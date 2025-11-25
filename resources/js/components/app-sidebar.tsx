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
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, DollarSign, FileText, Users, ShoppingCart, Receipt, Bell, Zap, Settings, History, TrendingUp, Layers, Database, Tag, MapPin, Calculator, Percent } from 'lucide-react';
import AppLogo from './app-logo';
import React, { useEffect, useRef } from 'react';
import { type NavGroup } from '@/types';

// Role-based sidebar color schemes
const roleColorSchemes: Record<string, {
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
}> = {
    'super_admin': {
        sidebar: '#4c1d95', // violet-900
        sidebarForeground: '#f5f3ff',
        sidebarPrimary: '#a78bfa',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#5b21b6',
        sidebarAccentForeground: '#f5f3ff',
        sidebarBorder: '#5b21b6',
    },
    'admin': {
        sidebar: '#1e293b', // slate-800
        sidebarForeground: '#f8fafc',
        sidebarPrimary: '#94a3b8',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#334155',
        sidebarAccentForeground: '#f8fafc',
        sidebarBorder: '#334155',
    },
    'customer': {
        sidebar: '#1e3a5f', // blue dark
        sidebarForeground: '#eff6ff',
        sidebarPrimary: '#60a5fa',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#1e40af',
        sidebarAccentForeground: '#eff6ff',
        sidebarBorder: '#1e40af',
    },
    'vendor': {
        sidebar: '#78350f', // amber-900
        sidebarForeground: '#fffbeb',
        sidebarPrimary: '#fbbf24',
        sidebarPrimaryForeground: '#78350f',
        sidebarAccent: '#92400e',
        sidebarAccentForeground: '#fffbeb',
        sidebarBorder: '#92400e',
    },
    'supplier': {
        sidebar: '#064e3b', // emerald-900
        sidebarForeground: '#ecfdf5',
        sidebarPrimary: '#34d399',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#065f46',
        sidebarAccentForeground: '#ecfdf5',
        sidebarBorder: '#065f46',
    },
    'purchase': {
        sidebar: '#7c2d12', // orange-900
        sidebarForeground: '#fff7ed',
        sidebarPrimary: '#fb923c',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#9a3412',
        sidebarAccentForeground: '#fff7ed',
        sidebarBorder: '#9a3412',
    },
};

const navGroups: NavGroup[] = [
    // {
    //     title: 'Overview',
    //     items: [
    //         { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    //     ],
    // },
    {
        title: 'Master Data',
        items: [
            { title: 'Items', href: '/items', icon: Database },
            { title: 'Unit of Measures', href: '/unit-of-measures', icon: Layers },
            { title: 'Tax Codes', href: '/tax-codes', icon: Receipt },
            { title: 'Charges', href: '/charges', icon: Tag },
            { title: 'Container Types', href: '/container-types', icon: Layers },
            { title: 'Ports', href: '/ports', icon: MapPin },
            { title: 'Suppliers', href: '/suppliers', icon: Users },
            { title: 'Customers', href: '/customers', icon: Users },
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
    // {
    //     title: 'Monitoring',
    //     items: [
    //         { title: 'Notifications', href: '/notifications', icon: Bell },
    //         { title: 'Audit Logs', href: '/audit-logs', icon: History },
    //     ],
    // },
    // {
    //     title: 'Administration',
    //     items: [
    //         { title: 'Settings', href: '/admin/settings', icon: Settings },
    //     ],
    // },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const roleSlug = (auth as any)?.user?.role_slug || 'customer';
    const colorScheme = roleColorSchemes[roleSlug] || roleColorSchemes['customer'];

    const SCROLL_KEY = 'sidebar_scroll_top';
    const contentRef = useRef<HTMLDivElement | null>(null);

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

    // Apply role-based sidebar colors via CSS custom properties
    const sidebarStyle = {
        '--sidebar': colorScheme.sidebar,
        '--sidebar-foreground': colorScheme.sidebarForeground,
        '--sidebar-primary': colorScheme.sidebarPrimary,
        '--sidebar-primary-foreground': colorScheme.sidebarPrimaryForeground,
        '--sidebar-accent': colorScheme.sidebarAccent,
        '--sidebar-accent-foreground': colorScheme.sidebarAccentForeground,
        '--sidebar-border': colorScheme.sidebarBorder,
        '--color-sidebar': colorScheme.sidebar,
        '--color-sidebar-foreground': colorScheme.sidebarForeground,
        '--color-sidebar-primary': colorScheme.sidebarPrimary,
        '--color-sidebar-primary-foreground': colorScheme.sidebarPrimaryForeground,
        '--color-sidebar-accent': colorScheme.sidebarAccent,
        '--color-sidebar-accent-foreground': colorScheme.sidebarAccentForeground,
        '--color-sidebar-border': colorScheme.sidebarBorder,
    } as React.CSSProperties;

    return (
        <Sidebar collapsible="icon" variant="inset" style={sidebarStyle}>
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
