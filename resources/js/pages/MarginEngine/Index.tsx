import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Edit2, Trash2, Plus, Check, X, Zap, TrendingUp, BarChart3, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface MarginRule {
    id: number;
    precedence: number;
    charge_id: number | null;
    customer_id: number | null;
    margin_percentage: number;
    margin_fixed_inr: number;
    is_active: boolean;
    notes: string | null;
    charge?: { id: number; code: string; name: string };
    customer?: { id: number; name: string; company_name: string };
}

interface Charge {
    id: number;
    charge_code: string;
    charge_name: string;
    is_active: boolean;
}

interface Customer {
    id: number;
    name: string;
    company_name: string;
}

interface PageProps {
    rules: MarginRule[];
    charges: Charge[];
    customers: Customer[];
    csrf_token?: string;
}

const SpecificityBadge = ({ rule }: { rule: MarginRule }) => {
    if (rule.charge_id && rule.customer_id) {
        return <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">Specific Deal</Badge>;
    }
    if (rule.charge_id) {
        return <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">Charge Only</Badge>;
    }
    if (rule.customer_id) {
        return <Badge variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">Customer Only</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-600 text-white hover:bg-green-700">Global Default</Badge>;
};

const PrecedenceIndicator = ({ precedence }: { precedence: number }) => {
    const getVariant = (num: number) => {
        if (num === 1) return 'default';
        if (num === 2) return 'secondary';
        if (num === 3) return 'outline';
        return 'destructive';
    };
    
    return (
        <div className="flex items-center justify-center">
            <Badge variant={getVariant(precedence) as any} className="text-lg px-3 py-2 rounded-full">
                {precedence}
            </Badge>
        </div>
    );
};

export default function MarginEngineIndex() {
    const { rules, charges, customers } = usePage().props as any;
    const [displayRules, setDisplayRules] = useState<MarginRule[]>(rules);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'manage' | 'reference' | 'test'>('manage');
    const [testCost, setTestCost] = useState(1000);
    const [testChargeId, setTestChargeId] = useState<string>('');
    const [testCustomerId, setTestCustomerId] = useState<string>('');
    const [testResult, setTestResult] = useState<any>(null);

    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        return token || '';
    };

    const [formData, setFormData] = useState({
        precedence: 1,
        charge_id: '',
        customer_id: '',
        margin_percentage: 0.2,
        margin_fixed_inr: 0,
        notes: '',
    });

    const calculateTestPrice = async () => {
        setLoading(true);
        try {
            const response = await fetch('/margin-engine/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken(),
                },
                body: JSON.stringify({
                    cost_inr: testCost,
                    charge_id: testChargeId ? parseInt(testChargeId) : null,
                    customer_id: testCustomerId ? parseInt(testCustomerId) : null,
                }),
            });
            const data = await response.json();
            setTestResult(data);
        } catch (err: any) {
            setError('Failed to calculate price: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/margin-engine/add-rule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken(),
                },
                body: JSON.stringify({
                    precedence: formData.precedence,
                    charge_id: formData.charge_id ? parseInt(formData.charge_id) : null,
                    customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
                    margin_percentage: formData.margin_percentage,
                    margin_fixed_inr: formData.margin_fixed_inr,
                    notes: formData.notes,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setDisplayRules([data.rule, ...displayRules]);
                setSuccess('Margin rule created successfully');
                setFormData({ precedence: 1, charge_id: '', customer_id: '', margin_percentage: 0.2, margin_fixed_inr: 0, notes: '' });
                setShowAddForm(false);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError('Failed to create rule: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRule = async (ruleId: number) => {
        setLoading(true);
        try {
            const response = await fetch('/margin-engine/remove-rule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken(),
                },
                body: JSON.stringify({ rule_id: ruleId }),
            });
            if (response.ok) {
                setDisplayRules(displayRules.filter(r => r.id !== ruleId));
                setSuccess('Rule removed successfully');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError('Failed to remove rule: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const groupedBySpecificity = {
        specific: displayRules.filter(r => r.charge_id && r.customer_id),
        charge_only: displayRules.filter(r => r.charge_id && !r.customer_id),
        customer_only: displayRules.filter(r => !r.charge_id && r.customer_id),
        global: displayRules.filter(r => !r.charge_id && !r.customer_id),
    };

    return (
        <>
            <Head title="Margin Engine" />
            <AppLayout>
                <div className="w-full h-full flex-1 overflow-auto">
                    <div className="space-y-6 p-6 max-w-7xl">
                        {/* Hero Header */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Margin Engine</h1>
                                    <p className="text-gray-600 dark:text-gray-400">Optimize your sales markups and margin rules with precision</p>
                                </div>
                            </div>
                        </div>

                        {/* Alerts */}
                        {success && (
                            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <AlertTitle className="text-green-900 dark:text-green-100">Success</AlertTitle>
                                <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30" variant="destructive">
                                <AlertCircle className="h-5 w-5" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Main Tabs */}
                        <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="manage" className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Manage Rules
                                </TabsTrigger>
                                <TabsTrigger value="reference" className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Rule Reference
                                </TabsTrigger>
                                <TabsTrigger value="test" className="flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Test Calculator
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="manage" className="space-y-6">
                                {/* Add Rule Button */}
                                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                            <Plus className="w-4 h-4" />
                                            Add New Rule
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Create Margin Rule</DialogTitle>
                                            <DialogDescription>Add a new margin rule to your pricing engine</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddRule} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Precedence</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={formData.precedence}
                                                        onChange={(e: any) => setFormData({ ...formData, precedence: parseInt(e.target.value) })}
                                                        placeholder="Priority level"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Charge (Optional)</label>
                                                    <Select value={formData.charge_id.toString()} onValueChange={(v: string) => setFormData({ ...formData, charge_id: v })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All Charges" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">All Charges</SelectItem>
                                                            {charges.map((c: Charge) => (
                                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                                    {c.charge_code} - {c.charge_name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Customer (Optional)</label>
                                                    <Select value={formData.customer_id.toString()} onValueChange={(v: string) => setFormData({ ...formData, customer_id: v })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All Customers" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">All Customers</SelectItem>
                                                            {customers.map((c: Customer) => (
                                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                                    {c.company_name || c.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Margin % (0-1)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="1"
                                                        value={formData.margin_percentage}
                                                        onChange={(e: any) => setFormData({ ...formData, margin_percentage: parseFloat(e.target.value) })}
                                                        placeholder="Percentage margin"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Fixed Margin (₹)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={formData.margin_fixed_inr}
                                                        onChange={(e: any) => setFormData({ ...formData, margin_fixed_inr: parseFloat(e.target.value) })}
                                                        placeholder="Fixed amount"
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <label className="text-sm font-medium">Notes</label>
                                                    <Input
                                                        type="text"
                                                        value={formData.notes}
                                                        onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                                                        placeholder="e.g., Premium customer volume discount"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-4">
                                                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                                    {loading ? 'Creating...' : 'Create Rule'}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                {/* Rules Grid */}
                                {displayRules.length === 0 ? (
                                    <Card className="border-2 border-dashed">
                                        <CardContent className="pt-10 text-center">
                                            <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No margin rules found</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Create your first margin rule to get started</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {displayRules.map((rule: MarginRule) => (
                                            <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex gap-4 flex-1">
                                                            <div>
                                                                <PrecedenceIndicator precedence={rule.precedence} />
                                                            </div>
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <SpecificityBadge rule={rule} />
                                                                    {rule.charge_id && (
                                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                                                            {rule.charge?.code} - {rule.charge?.name}
                                                                        </Badge>
                                                                    )}
                                                                    {rule.customer_id && (
                                                                        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                                                                            {rule.customer?.company_name || rule.customer?.name}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">Margin %</p>
                                                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{(Number(rule.margin_percentage) * 100).toFixed(2)}%</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">Fixed Amount</p>
                                                                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">₹{Number(rule.margin_fixed_inr).toFixed(2)}</p>
                                                                    </div>
                                                                    {rule.notes && (
                                                                        <div>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">Notes</p>
                                                                            <p className="text-sm italic text-gray-600 dark:text-gray-300">{rule.notes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteRule(rule.id)}
                                                            disabled={loading}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="reference" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Specific Deals */}
                                    <Card className="border-l-4 border-l-red-600">
                                        <CardHeader className="bg-red-50 dark:bg-red-950/30">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-red-600 h-8 w-8 flex items-center justify-center rounded-full p-0">4</Badge>
                                                <div>
                                                    <CardTitle>Specific Deals</CardTitle>
                                                    <CardDescription>Charge + Customer</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            {groupedBySpecificity.specific.length === 0 ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">No specific deals configured</p>
                                            ) : (
                                                groupedBySpecificity.specific.map((r: MarginRule) => (
                                                    <div key={r.id} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{r.charge?.name}</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">{r.customer?.company_name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-red-600 dark:text-red-400">{(Number(r.margin_percentage) * 100).toFixed(1)}%</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">₹{Number(r.margin_fixed_inr).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Charge Only */}
                                    <Card className="border-l-4 border-l-blue-600">
                                        <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-blue-600 h-8 w-8 flex items-center justify-center rounded-full p-0">3</Badge>
                                                <div>
                                                    <CardTitle>Charge-Specific</CardTitle>
                                                    <CardDescription>Charge only rules</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            {groupedBySpecificity.charge_only.length === 0 ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">No charge-specific rules configured</p>
                                            ) : (
                                                groupedBySpecificity.charge_only.map((r: MarginRule) => (
                                                    <div key={r.id} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                                                        <p className="font-medium text-sm flex-1">{r.charge?.name}</p>
                                                        <div className="text-right">
                                                            <p className="font-bold text-blue-600 dark:text-blue-400">{(Number(r.margin_percentage) * 100).toFixed(1)}%</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">₹{Number(r.margin_fixed_inr).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Customer Only */}
                                    <Card className="border-l-4 border-l-purple-600">
                                        <CardHeader className="bg-purple-50 dark:bg-purple-950/30">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-purple-600 h-8 w-8 flex items-center justify-center rounded-full p-0">2</Badge>
                                                <div>
                                                    <CardTitle>Customer-Specific</CardTitle>
                                                    <CardDescription>Customer only rules</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            {groupedBySpecificity.customer_only.length === 0 ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">No customer-specific rules configured</p>
                                            ) : (
                                                groupedBySpecificity.customer_only.map((r: MarginRule) => (
                                                    <div key={r.id} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                                                        <p className="font-medium text-sm flex-1">{r.customer?.company_name}</p>
                                                        <div className="text-right">
                                                            <p className="font-bold text-purple-600 dark:text-purple-400">{(Number(r.margin_percentage) * 100).toFixed(1)}%</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">₹{Number(r.margin_fixed_inr).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Global Default */}
                                    <Card className="border-l-4 border-l-green-600">
                                        <CardHeader className="bg-green-50 dark:bg-green-950/30">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-green-600 h-8 w-8 flex items-center justify-center rounded-full p-0">1</Badge>
                                                <div>
                                                    <CardTitle>Global Default</CardTitle>
                                                    <CardDescription>Fallback rule</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            {groupedBySpecificity.global.length === 0 ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">No global default configured</p>
                                            ) : (
                                                groupedBySpecificity.global.map((r: MarginRule) => (
                                                    <div key={r.id} className="flex justify-between items-center">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Applies to all</p>
                                                        <div className="text-right">
                                                            <p className="font-bold text-green-600 dark:text-green-400">{(Number(r.margin_percentage) * 100).toFixed(1)}%</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">₹{Number(r.margin_fixed_inr).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="test" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Test Sale Price Calculator</CardTitle>
                                        <CardDescription>Simulate price calculations with your margin rules</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Cost Amount (₹)</label>
                                                <Input
                                                    type="number"
                                                    value={testCost}
                                                    onChange={(e: any) => setTestCost(parseFloat(e.target.value))}
                                                    placeholder="Enter cost"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Charge</label>
                                                <Select value={testChargeId} onValueChange={(v: string) => setTestChargeId(v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Global Rule" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Global Rule</SelectItem>
                                                        {charges.map((c: Charge) => (
                                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                                {c.charge_code}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Customer</label>
                                                <Select value={testCustomerId} onValueChange={(v: string) => setTestCustomerId(v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All Customers" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">All Customers</SelectItem>
                                                        {customers.map((c: Customer) => (
                                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                                {c.company_name || c.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={calculateTestPrice}
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
                                        >
                                            <Zap className="w-4 h-4" />
                                            {loading ? 'Calculating...' : 'Calculate Sale Price'}
                                        </Button>

                                        {testResult && (
                                            <>
                                                <Separator />
                                                <div className="space-y-4">
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        <Check className="w-5 h-5 text-green-600" />
                                                        Calculation Result
                                                    </h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <Card className="bg-gray-50 dark:bg-gray-900">
                                                            <CardContent className="pt-4">
                                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-1">Cost</p>
                                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{testResult.cost_inr?.toFixed(2)}</p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card className="bg-blue-50 dark:bg-blue-950/30">
                                                            <CardContent className="pt-4">
                                                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase mb-1">Margin %</p>
                                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(testResult.margin_applied * 100).toFixed(2)}%</p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card className="bg-purple-50 dark:bg-purple-950/30">
                                                            <CardContent className="pt-4">
                                                                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase mb-1">Fixed Margin</p>
                                                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{testResult.margin_fixed?.toFixed(2)}</p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card className="bg-green-50 dark:bg-green-950/30 border-2 border-green-600">
                                                            <CardContent className="pt-4">
                                                                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase mb-1">Sale Price</p>
                                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{testResult.sale_price?.toFixed(2)}</p>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                    <Card className="bg-blue-50 dark:bg-blue-950/30">
                                                        <CardContent className="pt-4 space-y-2">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Specificity</p>
                                                                <Badge className="mt-2">{testResult.specificity}</Badge>
                                                            </div>
                                                            <div className="pt-2 border-t">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Calculation</p>
                                                                <p className="text-sm font-mono text-gray-600 dark:text-gray-300">{testResult.calculation}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
