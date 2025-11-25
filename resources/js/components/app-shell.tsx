import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

// Complete role-based color themes - each role has its own unique portal feel
const roleThemes: Record<string, {
    // Sidebar colors
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    // Main content area colors
    background: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    primary: string;
    primaryForeground: string;
}> = {
    'super_admin': {
        // Violet theme
        sidebar: '#4c1d95',
        sidebarForeground: '#f5f3ff',
        sidebarPrimary: '#a78bfa',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#5b21b6',
        sidebarAccentForeground: '#f5f3ff',
        sidebarBorder: '#6d28d9',
        // Content
        background: '#faf5ff',
        card: '#fefcff',
        cardForeground: '#1e1b4b',
        muted: '#f3e8ff',
        mutedForeground: '#6b21a8',
        accent: '#ede9fe',
        accentForeground: '#4c1d95',
        border: '#e9d5ff',
        primary: '#7c3aed',
        primaryForeground: '#ffffff',
    },
    'admin': {
        // Slate theme
        sidebar: '#1e293b',
        sidebarForeground: '#f8fafc',
        sidebarPrimary: '#94a3b8',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#334155',
        sidebarAccentForeground: '#f8fafc',
        sidebarBorder: '#475569',
        // Content
        background: '#f8fafc',
        card: '#ffffff',
        cardForeground: '#0f172a',
        muted: '#f1f5f9',
        mutedForeground: '#475569',
        accent: '#e2e8f0',
        accentForeground: '#1e293b',
        border: '#e2e8f0',
        primary: '#475569',
        primaryForeground: '#ffffff',
    },
    'customer': {
        // Blue theme
        sidebar: '#1e3a5f',
        sidebarForeground: '#eff6ff',
        sidebarPrimary: '#60a5fa',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#1e40af',
        sidebarAccentForeground: '#eff6ff',
        sidebarBorder: '#2563eb',
        // Content
        background: '#eff6ff',
        card: '#f8faff',
        cardForeground: '#1e3a8a',
        muted: '#dbeafe',
        mutedForeground: '#1d4ed8',
        accent: '#bfdbfe',
        accentForeground: '#1e40af',
        border: '#bfdbfe',
        primary: '#2563eb',
        primaryForeground: '#ffffff',
    },
    'vendor': {
        // Amber/Orange theme
        sidebar: '#78350f',
        sidebarForeground: '#fffbeb',
        sidebarPrimary: '#fbbf24',
        sidebarPrimaryForeground: '#78350f',
        sidebarAccent: '#92400e',
        sidebarAccentForeground: '#fffbeb',
        sidebarBorder: '#b45309',
        // Content
        background: '#fffbeb',
        card: '#fffef5',
        cardForeground: '#78350f',
        muted: '#fef3c7',
        mutedForeground: '#92400e',
        accent: '#fde68a',
        accentForeground: '#78350f',
        border: '#fcd34d',
        primary: '#d97706',
        primaryForeground: '#ffffff',
    },
    'supplier': {
        // Emerald/Green theme
        sidebar: '#064e3b',
        sidebarForeground: '#ecfdf5',
        sidebarPrimary: '#34d399',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#065f46',
        sidebarAccentForeground: '#ecfdf5',
        sidebarBorder: '#047857',
        // Content
        background: '#ecfdf5',
        card: '#f0fdf9',
        cardForeground: '#064e3b',
        muted: '#d1fae5',
        mutedForeground: '#047857',
        accent: '#a7f3d0',
        accentForeground: '#065f46',
        border: '#6ee7b7',
        primary: '#059669',
        primaryForeground: '#ffffff',
    },
    'purchase': {
        // Orange/Red theme
        sidebar: '#7c2d12',
        sidebarForeground: '#fff7ed',
        sidebarPrimary: '#fb923c',
        sidebarPrimaryForeground: '#ffffff',
        sidebarAccent: '#9a3412',
        sidebarAccentForeground: '#fff7ed',
        sidebarBorder: '#c2410c',
        // Content
        background: '#fff7ed',
        card: '#fffaf5',
        cardForeground: '#7c2d12',
        muted: '#ffedd5',
        mutedForeground: '#c2410c',
        accent: '#fed7aa',
        accentForeground: '#9a3412',
        border: '#fdba74',
        primary: '#ea580c',
        primaryForeground: '#ffffff',
    },
};

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const { sidebarOpen, auth } = usePage<SharedData>().props;
    const roleSlug = (auth?.user as any)?.role_slug || 'customer';
    const theme = roleThemes[roleSlug] || roleThemes['customer'];

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    // Apply complete role-based theme via CSS custom properties
    const themeStyle = {
        // Sidebar
        '--sidebar': theme.sidebar,
        '--sidebar-foreground': theme.sidebarForeground,
        '--sidebar-primary': theme.sidebarPrimary,
        '--sidebar-primary-foreground': theme.sidebarPrimaryForeground,
        '--sidebar-accent': theme.sidebarAccent,
        '--sidebar-accent-foreground': theme.sidebarAccentForeground,
        '--sidebar-border': theme.sidebarBorder,
        '--color-sidebar': theme.sidebar,
        '--color-sidebar-foreground': theme.sidebarForeground,
        '--color-sidebar-primary': theme.sidebarPrimary,
        '--color-sidebar-primary-foreground': theme.sidebarPrimaryForeground,
        '--color-sidebar-accent': theme.sidebarAccent,
        '--color-sidebar-accent-foreground': theme.sidebarAccentForeground,
        '--color-sidebar-border': theme.sidebarBorder,
        // Main content
        '--background': theme.background,
        '--card': theme.card,
        '--card-foreground': theme.cardForeground,
        '--muted': theme.muted,
        '--muted-foreground': theme.mutedForeground,
        '--accent': theme.accent,
        '--accent-foreground': theme.accentForeground,
        '--border': theme.border,
        '--primary': theme.primary,
        '--primary-foreground': theme.primaryForeground,
        '--color-background': theme.background,
        '--color-card': theme.card,
        '--color-card-foreground': theme.cardForeground,
        '--color-muted': theme.muted,
        '--color-muted-foreground': theme.mutedForeground,
        '--color-accent': theme.accent,
        '--color-accent-foreground': theme.accentForeground,
        '--color-border': theme.border,
        '--color-primary': theme.primary,
        '--color-primary-foreground': theme.primaryForeground,
    } as React.CSSProperties;

    return (
        <SidebarProvider defaultOpen={sidebarOpen} style={themeStyle}>
            {children}
        </SidebarProvider>
    );
}
