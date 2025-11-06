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
import { BookOpen, Folder, LayoutGrid, Package, DollarSign, FileText, Users, ShoppingCart, Receipt, Bell, Zap, Settings, History, TrendingUp } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: Receipt,
    },
    {
        title: 'Shipments',
        href: '/shipments',
        icon: Package,
    },
    {
        title: 'Rate Cards',
        href: '/rate-cards',
        icon: DollarSign,
    },
    {
        title: 'Quotes',
        href: '/quotes',
        icon: FileText,
    },
    {
        title: 'Integrations',
        href: '/integrations/carriers',
        icon: Zap,
    },
    {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
    {
        title: 'Audit Logs',
        href: '/audit-logs',
        icon: History,
    },
    {
        title: 'Price Comparison',
        href: '/price-comparisons',
        icon: TrendingUp,
    },
    {
        title: 'Forwarding Prices',
        href: '/forwarding-prices',
        icon: DollarSign,
    },
    {
        title: 'Courier Prices',
        href: '/courier-prices',
        icon: DollarSign,
    },
    {
        title: 'Packaging Prices',
        href: '/packaging-prices',
        icon: DollarSign,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
