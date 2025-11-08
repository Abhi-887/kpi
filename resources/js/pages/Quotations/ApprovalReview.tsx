import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Quotation {
    id: number;
    quote_id: string;
    customer: { company_name: string };
    salesperson: { name: string };
    mode: string;
    movement: string;
    total_cost_inr: number;
    total_sale_price_inr: number;
    margin_percentage: number;
}

interface ApprovalReviewProps {
    quotation: Quotation;
    summary: {
        total_cost_inr: number;
        total_sale_price_inr: number;
        margin_percentage: number;
        margin_amount_inr: number;
    };
    approval?: any;
}

export default function ApprovalReview({ quotation, summary }: ApprovalReviewProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Quotations', href: '/quotations' },
        { title: 'Approvals', href: '/quotations-approval' },
        { title: quotation.quote_id, href: `/quotations/${quotation.id}` },
    ];

    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [comments, setComments] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = () => {
        setIsApproving(true);
        router.post(
            `/quotations-approval/${quotation.id}/approve`,
            { comments },
            {
                onFinish: () => setIsApproving(false),
            }
        );
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        setIsRejecting(true);
        router.post(
            `/quotations-approval/${quotation.id}/reject`,
            { rejection_reason: rejectionReason },
            {
                onFinish: () => setIsRejecting(false),
            }
        );
    };

    const marginStatus = summary.margin_percentage >= 10 ? 'good' : 'warning';
    const costStatus = summary.total_cost_inr > 10000 ? 'requires-approval' : 'normal';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Approve ${quotation.quote_id}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{quotation.quote_id}</h1>
                        <p className="text-muted-foreground mt-1">
                            {quotation.customer?.company_name} • {quotation.mode} • {quotation.movement}
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Cost Card */}
                    <Card className={costStatus === 'requires-approval' ? 'border-orange-500' : ''}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">₹{summary.total_cost_inr.toFixed(2)}</p>
                            {costStatus === 'requires-approval' && (
                                <p className="text-xs text-orange-600 mt-1">Above ₹10,000 threshold</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sale Price Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Sale Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">₹{summary.total_sale_price_inr.toFixed(2)}</p>
                        </CardContent>
                    </Card>

                    {/* Margin Card */}
                    <Card className={marginStatus === 'warning' ? 'border-red-500' : ''}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Margin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{summary.margin_percentage.toFixed(2)}%</p>
                                    <p className="text-xs text-muted-foreground">
                                        ₹{summary.margin_amount_inr.toFixed(2)}
                                    </p>
                                </div>
                                <Badge
                                    variant={marginStatus === 'good' ? 'default' : 'destructive'}
                                >
                                    {marginStatus === 'good' ? 'Healthy' : 'Low'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details and Approval */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Quotation Details */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Quotation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                    <p className="font-medium">{quotation.customer?.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Salesperson</p>
                                    <p className="font-medium">{quotation.salesperson?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Mode</p>
                                    <p className="font-medium">{quotation.mode}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Movement</p>
                                    <p className="font-medium">{quotation.movement}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approval Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Approval Decision</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Comments (Optional)</label>
                                <Input
                                    placeholder="Add approval comments..."
                                    value={comments}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComments(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    {isApproving ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button
                                    onClick={() => setIsRejecting(!isRejecting)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                </Button>
                            </div>
                            {isRejecting && (
                                <div className="space-y-2 border-t pt-4">
                                    <label className="text-sm font-medium">Rejection Reason *</label>
                                    <Input
                                        placeholder="Explain why this quotation is being rejected..."
                                        value={rejectionReason}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleReject}
                                            disabled={isRejecting || !rejectionReason.trim()}
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            Confirm Reject
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsRejecting(false);
                                                setRejectionReason('');
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Cost and Sale Lines Summary */}
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Cost Breakdown</h3>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Charge</TableHead>
                                            <TableHead className="text-right">Unit Cost</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                                Loading cost details...
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
