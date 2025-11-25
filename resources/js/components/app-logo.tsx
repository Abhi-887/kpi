import AppLogoIcon from './app-logo-icon';
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

// Portal names for each role
const portalNames: Record<string, string> = {
    'super_admin': 'Super Admin Portal',
    'admin': 'Admin Portal',
    'customer': 'Customer Portal',
    'vendor': 'Vendor Portal',
    'supplier': 'Supplier Portal',
    'purchase': 'Purchase Portal',
};

export default function AppLogo() {
    const { auth } = usePage<SharedData>().props;
    const roleSlug = (auth?.user as any)?.role_slug || 'customer';
    const portalName = portalNames[roleSlug] || 'Portal';
    
    const appName = useMemo(() => {
        return (import.meta.env.VITE_APP_NAME as string) || 'Shipmate';
    }, []);
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    {appName}
                </span>
                <span className="truncate text-[10px] leading-tight opacity-70">
                    {portalName}
                </span>
            </div>
        </>
    );
}
