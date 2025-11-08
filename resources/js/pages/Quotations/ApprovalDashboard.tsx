import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Eye, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Quotation {
    id: number;
    quote_id: string;
    customer: { company_name: string };
    total_cost_inr: number;
    total_sale_price_inr: number;
    margin_percentage: number;
    created_at: string;
    approval?: { approval_status: string };
}

interface ApprovalDashboardProps {
    pending_approvals: {
        data: Quotation[];
        links: any[];
        meta: any;
    };
}

export default function ApprovalDashboard({ pending_approvals }: ApprovalDashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Quotations', href: '/quotations' },
        { title: 'Pending Approvals', href: '/quotations-approval' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quotation Approvals" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading title="Quotation Approvals" description="Review and approve pending quotations" />

                {/* Approvals Table */}
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quote ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total Cost</TableHead>
                                <TableHead>Total Sale</TableHead>
                                <TableHead>Margin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pending_approvals.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No pending approvals
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pending_approvals.data.map((quotation: any) => (
                                    <TableRow key={quotation.id}>
                                        <TableCell className="font-mono font-medium">
                                            {quotation.quote_id}
                                        </TableCell>
                                        <TableCell>{quotation.customer?.company_name}</TableCell>
                                        <TableCell>₹{quotation.total_cost_inr?.toFixed(2)}</TableCell>
                                        <TableCell>₹{quotation.total_sale_price_inr?.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    quotation.margin_percentage >= 10
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {quotation.margin_percentage?.toFixed(2)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Pending
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(quotation.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/quotations-approval/${quotation.id}`}>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    title="Review"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Review
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
