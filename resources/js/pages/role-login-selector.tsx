import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogoIcon from '@/components/app-logo-icon';

interface RoleLoginOption {
    slug: string;
    label: string;
    description: string;
    color: string;
    hexColor: string;
    icon: string;
}

const roleOptions: RoleLoginOption[] = [
    {
        slug: 'super_admin',
        label: 'Super Admin',
        description: 'Complete system access and management',
        color: 'violet',
        hexColor: '#7c3aed',
        icon: '👑',
    },
    {
        slug: 'admin',
        label: 'Admin',
        description: 'Manage operations and users',
        color: 'slate',
        hexColor: '#64748b',
        icon: '⚙️',
    },
    {
        slug: 'customer',
        label: 'Customer',
        description: 'View orders and shipments',
        color: 'blue',
        hexColor: '#3b82f6',
        icon: '🛍️',
    },
    {
        slug: 'vendor',
        label: 'Vendor',
        description: 'Manage pricing and quotations',
        color: 'amber',
        hexColor: '#d97706',
        icon: '🏪',
    },
    {
        slug: 'supplier',
        label: 'Supplier',
        description: 'Manage inventory and orders',
        color: 'emerald',
        hexColor: '#10b981',
        icon: '📦',
    },
    {
        slug: 'purchase',
        label: 'Purchase Manager',
        description: 'Manage procurement',
        color: 'orange',
        hexColor: '#ea580c',
        icon: '📋',
    },
];

export default function RoleLoginSelector() {
    return (
        <>
            <Head title="Select Role - CSA" />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
                <div className="mx-auto max-w-6xl space-y-12">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
                                <AppLogoIcon className="size-7 fill-current text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">CSA</h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Select your role to access your dashboard
                            </p>
                        </div>
                    </div>

                    {/* Role Cards Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {roleOptions.map((role) => (
                            <Link
                                key={role.slug}
                                href={`/login/${role.slug}`}
                                className="group"
                            >
                                <Card className="h-full transition-all hover:border-foreground hover:shadow-lg">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl">
                                                    {role.label}
                                                </CardTitle>
                                                <CardDescription className="mt-2">
                                                    {role.description}
                                                </CardDescription>
                                            </div>
                                            <div className="text-3xl">{role.icon}</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            className="w-full"
                                            style={{ backgroundColor: role.hexColor }}
                                        >
                                            Log in
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Test Credentials Footer */}
                    <div className="rounded-lg border border-muted bg-muted/30 p-6">
                        <h3 className="font-semibold">Test Credentials</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            All test accounts use password: <code className="rounded bg-muted px-2 py-1 font-mono">password</code>
                        </p>
                        <div className="mt-4 grid gap-2 text-sm">
                            {roleOptions.map((role) => (
                                <div key={role.slug} className="flex justify-between">
                                    <span className="text-muted-foreground">{role.label}:</span>
                                    <code className="font-mono">{role.slug}@csa.local</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
