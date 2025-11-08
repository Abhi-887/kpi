import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useAlertContext } from '@/providers/alert-provider';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage();
    const { success, error, warning, info } = useAlertContext();

    useEffect(() => {
        const alert = (props as any).alert;
        if (alert) {
            const { type, title, message } = alert;
            if (type === 'success') success(title, message);
            else if (type === 'error') error(title, message);
            else if (type === 'warning') warning(title, message);
            else if (type === 'info') info(title, message);
        }
    }, [(props as any).alert, success, error, warning, info]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
