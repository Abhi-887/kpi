import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ErrorProps {
    status: number;
    title: string;
    message: string;
}

export default function Error({ status, title, message }: ErrorProps) {
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <AppLayout>
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        </div>
                    </div>

                    <div className="mb-2">
                        <span className="inline-block px-3 py-1 text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/20 rounded-full">
                            Error {status}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        {title}
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button
                            asChild
                            variant="outline"
                            className="gap-2"
                        >
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="gap-2"
                        >
                            <Link href="/dashboard">
                                Dashboard
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            If you believe this is a mistake, please contact support.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
