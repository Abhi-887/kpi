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
import { getMenuItemsForRole } from '@/utils/role-config';
import { dashboard } from '@/routes';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { useEffect, useRef } from 'react';
import { type NavGroup } from '@/types';

export function AppSidebarWithRole() {
    const { auth } = usePage().props;
    const user = (auth as any)?.user;

    // Get menu items based on user role
    const menuItems = user ? getMenuItemsForRole(user.role_slug) : [];

    // Convert flat menu items to NavGroup structure
    const navGroups: NavGroup[] = [
        {
            title: 'Menu',
            items: menuItems.map((item: any) => ({
                title: item.label,
                href: item.href,
                icon: item.icon,
            })),
        },
    ];

    const hasScrolled = useRef(false);

    useEffect(() => {
        const scrollableElement = document.querySelector('[data-sidebar-scrollable]');
        if (scrollableElement && !hasScrolled.current) {
            const activeLink = scrollableElement.querySelector('[data-active-link="true"]');
            if (activeLink) {
                activeLink.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                hasScrolled.current = true;
            }
        }
    }, []);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <Link href={dashboard()}>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="lg" isActive>
                                <AppLogo />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </Link>
            </SidebarHeader>
            <SidebarContent data-sidebar-scrollable>
                <NavMain groups={navGroups} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={[]} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
