import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

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
    'super-admin': {
        sidebar: 'oklch(0.25 0.05 285)', // violet dark
        sidebarForeground: 'oklch(0.98 0.01 285)',
        sidebarPrimary: 'oklch(0.7 0.15 285)',
        sidebarPrimaryForeground: 'oklch(1 0 0)',
        sidebarAccent: 'oklch(0.35 0.08 285)',
        sidebarAccentForeground: 'oklch(0.98 0.01 285)',
        sidebarBorder: 'oklch(0.35 0.08 285)',
    },
    'admin': {
        sidebar: 'oklch(0.23 0.01 260)', // slate dark
        sidebarForeground: 'oklch(0.98 0 0)',
        sidebarPrimary: 'oklch(0.6 0.02 260)',
        sidebarPrimaryForeground: 'oklch(1 0 0)',
        sidebarAccent: 'oklch(0.33 0.02 260)',
        sidebarAccentForeground: 'oklch(0.98 0 0)',
        sidebarBorder: 'oklch(0.33 0.02 260)',
    },
    'customer': {
        sidebar: 'oklch(0.28 0.08 240)', // blue dark
        sidebarForeground: 'oklch(0.98 0.01 240)',
        sidebarPrimary: 'oklch(0.6 0.15 240)',
        sidebarPrimaryForeground: 'oklch(1 0 0)',
        sidebarAccent: 'oklch(0.38 0.1 240)',
        sidebarAccentForeground: 'oklch(0.98 0.01 240)',
        sidebarBorder: 'oklch(0.38 0.1 240)',
    },
    'vendor': {
        sidebar: 'oklch(0.28 0.08 85)', // amber dark
        sidebarForeground: 'oklch(0.98 0.02 85)',
        sidebarPrimary: 'oklch(0.75 0.15 85)',
        sidebarPrimaryForeground: 'oklch(0.2 0.05 85)',
        sidebarAccent: 'oklch(0.38 0.1 85)',
        sidebarAccentForeground: 'oklch(0.98 0.02 85)',
        sidebarBorder: 'oklch(0.38 0.1 85)',
    },
    'supplier': {
        sidebar: 'oklch(0.28 0.1 160)', // emerald dark
        sidebarForeground: 'oklch(0.98 0.02 160)',
        sidebarPrimary: 'oklch(0.65 0.17 160)',
        sidebarPrimaryForeground: 'oklch(1 0 0)',
        sidebarAccent: 'oklch(0.38 0.12 160)',
        sidebarAccentForeground: 'oklch(0.98 0.02 160)',
        sidebarBorder: 'oklch(0.38 0.12 160)',
    },
    'purchase': {
        sidebar: 'oklch(0.3 0.1 50)', // orange dark
        sidebarForeground: 'oklch(0.98 0.02 50)',
        sidebarPrimary: 'oklch(0.7 0.17 50)',
        sidebarPrimaryForeground: 'oklch(1 0 0)',
        sidebarAccent: 'oklch(0.4 0.12 50)',
        sidebarAccentForeground: 'oklch(0.98 0.02 50)',
        sidebarBorder: 'oklch(0.4 0.12 50)',
    },
};

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const { sidebarOpen, auth } = usePage<SharedData>().props;
    const roleSlug = (auth?.user as any)?.role_slug || 'customer';
    const colorScheme = roleColorSchemes[roleSlug] || roleColorSchemes['customer'];

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    // Apply role-based sidebar colors via CSS custom properties
    const sidebarStyle = {
        '--sidebar': colorScheme.sidebar,
        '--sidebar-foreground': colorScheme.sidebarForeground,
        '--sidebar-primary': colorScheme.sidebarPrimary,
        '--sidebar-primary-foreground': colorScheme.sidebarPrimaryForeground,
        '--sidebar-accent': colorScheme.sidebarAccent,
        '--sidebar-accent-foreground': colorScheme.sidebarAccentForeground,
        '--sidebar-border': colorScheme.sidebarBorder,
    } as React.CSSProperties;

    return (
        <SidebarProvider defaultOpen={sidebarOpen} style={sidebarStyle}>
            {children}
        </SidebarProvider>
    );
}
