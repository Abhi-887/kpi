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
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, DollarSign, FileText, Users, ShoppingCart, Receipt, Bell, Zap, Settings, History, TrendingUp, Layers, Database, Tag } from 'lucide-react';
import AppLogo from './app-logo';
import React, { useEffect, useRef } from 'react';
import { type NavGroup } from '@/types';

const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ],
    },
    {
        title: 'Master Data',
        items: [
            { title: 'Items', href: '/items', icon: Database },
            { title: 'Unit of Measures', href: '/unit-of-measures', icon: Layers },
            { title: 'Tax Codes', href: '/tax-codes', icon: Receipt },
            { title: 'Suppliers', href: '/suppliers', icon: Users },
            { title: 'Customers', href: '/customers', icon: Users },
        ],
    },
    {
        title: 'Pricing',
        items: [
            { title: 'Price Lists', href: '/price-lists', icon: Tag },
            { title: 'Rate Cards', href: '/rate-cards', icon: DollarSign },
            {
                title: 'Pricing Tables',
                href: '/pricing',
                icon: DollarSign,
                children: [
                    { title: 'Packaging Prices', href: '/packaging-prices', icon: DollarSign },
                    { title: 'Courier Prices', href: '/courier-prices', icon: DollarSign },
                    { title: 'Forwarding Prices', href: '/forwarding-prices', icon: DollarSign },
                ],
            },
        ],
    },
    {
        title: 'Sales & Operations',
        items: [
            { title: 'Orders', href: '/orders', icon: ShoppingCart },
            { title: 'Shipments', href: '/shipments', icon: Package },
            { title: 'Invoices', href: '/invoices', icon: Receipt },
            { title: 'Quotes', href: '/quotes', icon: FileText },
        ],
    },
    {
        title: 'Integrations',
        items: [
            {
                title: 'Integrations',
                href: '/integrations',
                icon: Zap,
                children: [
                    { title: 'Carriers', href: '/integrations/carriers', icon: Package },
                    { title: 'Payment Gateways', href: '/integrations/payment-gateways', icon: DollarSign },
                ],
            },
        ],
    },
    {
        title: 'Analytics',
        items: [
            { title: 'Price Comparison', href: '/price-comparisons', icon: TrendingUp },
        ],
    },
    {
        title: 'Monitoring',
        items: [
            { title: 'Notifications', href: '/notifications', icon: Bell },
            { title: 'Audit Logs', href: '/audit-logs', icon: History },
        ],
    },
    {
        title: 'Administration',
        items: [
            { title: 'Settings', href: '/admin/settings', icon: Settings },
        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
