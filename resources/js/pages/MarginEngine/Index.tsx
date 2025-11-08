import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Edit2, Trash2, Plus, Check, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

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
    code: string;
    name: string;
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
}

const SpecificityBadge = ({ rule }: { rule: MarginRule }) => {
    if (rule.charge_id && rule.customer_id) {
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full font-semibold">Specific Deal</span>;
    }
    if (rule.charge_id) {
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full font-semibold">Charge Only</span>;
    }
    if (rule.customer_id) {
        return <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-xs rounded-full font-semibold">Customer Only</span>;
    }
    return <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full font-semibold">Global Default</span>;
};

const PrecedenceIndicator = ({ precedence }: { precedence: number }) => {
    const colors = ['bg-gray-200 dark:bg-gray-700', 'bg-green-200 dark:bg-green-800', 'bg-blue-200 dark:bg-blue-800', 'bg-purple-200 dark:bg-purple-800', 'bg-red-200 dark:bg-red-800'];
    const color = colors[Math.min(precedence, 4)] || colors[4];
    
    return (
        <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center font-bold text-center`}>
            {precedence}
        </div>
    );
};

export default function MarginEngineIndex() {
    const { rules, charges, customers } = usePage<PageProps>().props;
    const [displayRules, setDisplayRules] = useState<MarginRule[]>(rules);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'manage' | 'reference'>('manage');
    const [testCost, setTestCost] = useState(1000);
    const [testChargeId, setTestChargeId] = useState<number | null>(null);
    const [testCustomerId, setTestCustomerId] = useState<number | null>(null);
    const [testResult, setTestResult] = useState<any>(null);

    const [formData, setFormData] = useState({
        precedence: 1,
        charge_id: null as number | null,
        customer_id: null as number | null,
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
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    cost_inr: testCost,
                    charge_id: testChargeId,
                    customer_id: testCustomerId,
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
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const data = await response.json();
                setDisplayRules([data.rule, ...displayRules]);
                setSuccess('Margin rule created successfully');
                setFormData({ precedence: 1, charge_id: null, customer_id: null, margin_percentage: 0.2, margin_fixed_inr: 0, notes: '' });
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
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Margin Engine</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage sales markups and margin rules</p>
                        </div>
                    </div>

                    {/* Alerts */}
                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-gap-3">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <p className="text-green-800 dark:text-green-200">{success}</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedTab('manage')}
                                className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                                    selectedTab === 'manage'
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                Manage Rules
                            </button>
                            <button
                                onClick={() => setSelectedTab('reference')}
                                className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                                    selectedTab === 'reference'
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                Rule Reference
                            </button>
                            <button
                                onClick={() => setSelectedTab('test')}
                                className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                                    selectedTab === 'test'
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                Test Calculator
                            </button>
                        </div>
                    </div>

                    {/* Manage Rules Tab */}
                    {selectedTab === 'manage' && (
                        <div className="space-y-6">
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Rule
                            </button>

                            {showAddForm && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Margin Rule</h3>
                                    <form onSubmit={handleAddRule} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Precedence</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.precedence}
                                                    onChange={(e) => setFormData({ ...formData, precedence: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Charge (Optional)</label>
                                                <select
                                                    value={formData.charge_id || ''}
                                                    onChange={(e) => setFormData({ ...formData, charge_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value="">All Charges</option>
                                                    {charges.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.code} - {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer (Optional)</label>
                                                <select
                                                    value={formData.customer_id || ''}
                                                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value="">All Customers</option>
                                                    {customers.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.company_name || c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Margin % (0-1)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="1"
                                                    value={formData.margin_percentage}
                                                    onChange={(e) => setFormData({ ...formData, margin_percentage: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fixed Margin (₹)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.margin_fixed_inr}
                                                    onChange={(e) => setFormData({ ...formData, margin_fixed_inr: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                                                <input
                                                    type="text"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="e.g., Premium customer volume discount"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading ? 'Creating...' : 'Create Rule'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddForm(false)}
                                                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Rules List */}
                            <div className="space-y-4">
                                {displayRules.length === 0 ? (
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                                        <p className="text-gray-600 dark:text-gray-400">No margin rules found. Create one to get started.</p>
                                    </div>
                                ) : (
                                    displayRules.map((rule) => (
                                        <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <PrecedenceIndicator precedence={rule.precedence} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <SpecificityBadge rule={rule} />
                                                        {rule.charge_id && (
                                                            <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">
                                                                {rule.charge?.code} - {rule.charge?.name}
                                                            </span>
                                                        )}
                                                        {rule.customer_id && (
                                                            <span className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded">
                                                                {rule.customer?.company_name || rule.customer?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {(rule.margin_percentage * 100).toFixed(2)}% + ₹{rule.margin_fixed_inr.toFixed(2)}
                                                    </p>
                                                    {rule.notes && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 italic mt-1">{rule.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rule Reference Tab */}
                    {selectedTab === 'reference' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Specific Deals */}
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-red-200 dark:bg-red-800 rounded flex items-center justify-center text-sm font-bold">4</div>
                                        Specific Deals (Charge + Customer)
                                    </h3>
                                    <div className="space-y-2">
                                        {groupedBySpecificity.specific.length === 0 ? (
                                            <p className="text-sm text-red-600 dark:text-red-300">No specific deals configured</p>
                                        ) : (
                                            groupedBySpecificity.specific.map((r) => (
                                                <div key={r.id} className="text-sm text-red-800 dark:text-red-100">
                                                    {r.charge?.name} + {r.customer?.company_name}: {(r.margin_percentage * 100).toFixed(1)}% + ₹{r.margin_fixed_inr.toFixed(2)}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Charge Only */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded flex items-center justify-center text-sm font-bold">3</div>
                                        Charge-Specific Margins
                                    </h3>
                                    <div className="space-y-2">
                                        {groupedBySpecificity.charge_only.length === 0 ? (
                                            <p className="text-sm text-blue-600 dark:text-blue-300">No charge-specific rules configured</p>
                                        ) : (
                                            groupedBySpecificity.charge_only.map((r) => (
                                                <div key={r.id} className="text-sm text-blue-800 dark:text-blue-100">
                                                    {r.charge?.name}: {(r.margin_percentage * 100).toFixed(1)}% + ₹{r.margin_fixed_inr.toFixed(2)}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Customer Only */}
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded flex items-center justify-center text-sm font-bold">2</div>
                                        Customer-Specific Margins
                                    </h3>
                                    <div className="space-y-2">
                                        {groupedBySpecificity.customer_only.length === 0 ? (
                                            <p className="text-sm text-purple-600 dark:text-purple-300">No customer-specific rules configured</p>
                                        ) : (
                                            groupedBySpecificity.customer_only.map((r) => (
                                                <div key={r.id} className="text-sm text-purple-800 dark:text-purple-100">
                                                    {r.customer?.company_name}: {(r.margin_percentage * 100).toFixed(1)}% + ₹{r.margin_fixed_inr.toFixed(2)}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Global Default */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded flex items-center justify-center text-sm font-bold">1</div>
                                        Global Default
                                    </h3>
                                    <div className="space-y-2">
                                        {groupedBySpecificity.global.length === 0 ? (
                                            <p className="text-sm text-green-600 dark:text-green-300">No global default configured</p>
                                        ) : (
                                            groupedBySpecificity.global.map((r) => (
                                                <div key={r.id} className="text-sm text-green-800 dark:text-green-100">
                                                    Applies to all: {(r.margin_percentage * 100).toFixed(1)}% + ₹{r.margin_fixed_inr.toFixed(2)}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Test Calculator Tab */}
                    {selectedTab === 'test' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Test Sale Price Calculator</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={testCost}
                                        onChange={(e) => setTestCost(parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Charge</label>
                                    <select
                                        value={testChargeId || ''}
                                        onChange={(e) => setTestChargeId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Global Rule</option>
                                        {charges.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer</label>
                                    <select
                                        value={testCustomerId || ''}
                                        onChange={(e) => setTestCustomerId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Customers</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.company_name || c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={calculateTestPrice}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Calculating...' : 'Calculate Sale Price'}
                            </button>

                            {testResult && (
                                <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4 border-2 border-green-500">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Calculation Result</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Cost</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{testResult.cost_inr?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Margin %</p>
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{(testResult.margin_applied * 100).toFixed(2)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Fixed Margin</p>
                                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">₹{testResult.margin_fixed?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Sale Price</p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{testResult.sale_price?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Specificity:</strong> {testResult.specificity}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Formula:</strong> {testResult.calculation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
