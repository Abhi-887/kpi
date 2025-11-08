import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { useState, useEffect } from 'react'
import { Plus, X, AlertCircle, Check, Loader2, ChevronDown } from 'lucide-react'

interface Charge {
    id: number
    charge_id: string
    charge_code: string
    charge_name: string
    is_active: boolean
}

interface ChargeRule {
    id: number
    charge_id: number
    charge_code: string
    charge_name: string
    is_active: boolean
    notes?: string
}

interface RuleCombination {
    mode: string
    movement: string
    terms: string
}

interface PageProps {
    rules: ChargeRule[]
    combinations: RuleCombination[]
    charges: Charge[]
    modes: string[]
    movements: string[]
    commonTerms: string[]
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
}

export default function ChargeApplicabilityIndex({
    rules,
    combinations,
    charges,
    modes,
    movements,
    commonTerms,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/' },
        { title: 'Pricing', href: '#' },
        { title: 'Charge Applicability Engine', href: '#' },
    ]

    const [selectedMode, setSelectedMode] = useState<string>(modes[0] || '')
    const [selectedMovement, setSelectedMovement] = useState<string>(movements[0] || '')
    const [selectedTerms, setSelectedTerms] = useState<string>('ALL_TERMS')
    const [currentRules, setCurrentRules] = useState<ChargeRule[]>([])
    const [selectedCharges, setSelectedCharges] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [issues, setIssues] = useState<any[]>([])
    const [validating, setValidating] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    // Load rules when combination changes
    useEffect(() => {
        if (selectedMode && selectedMovement && selectedTerms) {
            loadRules()
        }
    }, [selectedMode, selectedMovement, selectedTerms])

    const loadRules = async () => {
        setLoading(true)
        try {
            const response = await fetch('/charge-applicability/get-rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: selectedMode,
                    movement: selectedMovement,
                    terms: selectedTerms,
                }),
            })

            const data = await response.json()
            if (data.success) {
                setCurrentRules(data.data)
                setSelectedCharges(data.data.map((r: ChargeRule) => r.charge_id))
            }
        } catch (error) {
            console.error('Failed to load rules:', error)
        } finally {
            setLoading(false)
        }
    }

    const addChargeToRules = async (chargeId: number) => {
        if (selectedCharges.includes(chargeId)) return

        setLoading(true)
        try {
            const response = await fetch('/charge-applicability/add-charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: selectedMode,
                    movement: selectedMovement,
                    terms: selectedTerms,
                    charge_id: chargeId,
                }),
            })

            const data = await response.json()
            if (data.success) {
                setSelectedCharges([...selectedCharges, chargeId])
                setSuccessMessage(`✓ ${charges.find(c => c.id === chargeId)?.charge_code} added`)
                setTimeout(() => setSuccessMessage(''), 3000)
                loadRules()
            }
        } catch (error) {
            console.error('Failed to add charge:', error)
        } finally {
            setLoading(false)
        }
    }

    const removeChargeFromRules = async (chargeId: number) => {
        setLoading(true)
        try {
            const response = await fetch('/charge-applicability/remove-charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: selectedMode,
                    movement: selectedMovement,
                    terms: selectedTerms,
                    charge_id: chargeId,
                }),
            })

            const data = await response.json()
            if (data.success) {
                setSelectedCharges(selectedCharges.filter(id => id !== chargeId))
                setSuccessMessage(`✓ ${charges.find(c => c.id === chargeId)?.charge_code} removed`)
                setTimeout(() => setSuccessMessage(''), 3000)
                loadRules()
            }
        } catch (error) {
            console.error('Failed to remove charge:', error)
        } finally {
            setLoading(false)
        }
    }

    const validateAllRules = async () => {
        setValidating(true)
        try {
            const response = await fetch('/charge-applicability/validate-rules', {
                method: 'POST',
            })

            const data = await response.json()
            if (data.success) {
                setIssues(data.issues)
                if (!data.issues_found) {
                    setSuccessMessage('✓ All rules are valid!')
                    setTimeout(() => setSuccessMessage(''), 3000)
                }
            }
        } catch (error) {
            console.error('Failed to validate rules:', error)
        } finally {
            setValidating(false)
        }
    }

    const availableCharges = charges.filter(c => !selectedCharges.includes(c.id))

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Charge Applicability Engine" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Charge Applicability Engine</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage which charges (Particulars) are applicable for each shipping scenario
                        </p>
                    </div>
                    <Button onClick={validateAllRules} disabled={validating} variant="outline">
                        {validating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                        Validate All Rules
                    </Button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10">
                        <CardContent className="flex items-center gap-2 pt-6">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-700 dark:text-green-300">{successMessage}</span>
                        </CardContent>
                    </Card>
                )}

                {/* Issues Alert */}
                {issues.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-100">
                                <AlertCircle className="w-4 h-4" />
                                Validation Issues Found ({issues.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {issues.map((issue, idx) => (
                                <div key={idx} className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>{issue.type}:</strong> {issue.message} ({issue.count} items)
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Main Content */}
                <Tabs defaultValue="manage" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manage">Manage Rules</TabsTrigger>
                        <TabsTrigger value="reference">Rule Reference</TabsTrigger>
                    </TabsList>

                    {/* Manage Tab */}
                    <TabsContent value="manage" className="space-y-4">
                        {/* Combination Selector */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Scenario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Mode */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mode of Transport</label>
                                        <Select value={selectedMode} onValueChange={setSelectedMode}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {modes.map(mode => (
                                                    <SelectItem key={mode} value={mode}>
                                                        {mode}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Movement */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type of Movement</label>
                                        <Select value={selectedMovement} onValueChange={setSelectedMovement}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {movements.map(movement => (
                                                    <SelectItem key={movement} value={movement}>
                                                        {movement}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Terms */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Incoterms</label>
                                        <Select value={selectedTerms} onValueChange={setSelectedTerms}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {commonTerms.map(term => (
                                                    <SelectItem key={term} value={term}>
                                                        {term === 'ALL_TERMS' ? 'All Terms (Universal)' : term}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Scenario: <strong>{selectedMode} • {selectedMovement} • {selectedTerms === 'ALL_TERMS' ? 'All Incoterms' : selectedTerms}</strong>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Rules */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Applicable Charges ({selectedCharges.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading rules...
                                    </div>
                                ) : currentRules.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentRules.map(rule => (
                                            <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{rule.charge_code}</div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">{rule.charge_name}</div>
                                                </div>
                                                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                                    {rule.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Button
                                                    onClick={() => removeChargeFromRules(rule.charge_id)}
                                                    disabled={loading}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                                        No charges assigned yet. Add charges below.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Add Charges */}
                        {availableCharges.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Add Charges to This Scenario</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {availableCharges.map(charge => (
                                            <Button
                                                key={charge.id}
                                                onClick={() => addChargeToRules(charge.id)}
                                                disabled={loading}
                                                variant="outline"
                                                className="justify-start h-auto flex-col items-start p-3 text-left"
                                            >
                                                <div className="font-medium text-sm">{charge.charge_code}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">{charge.charge_name}</div>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Reference Tab */}
                    <TabsContent value="reference" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Complete Rule Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    {combinations.map((combo: RuleCombination, idx: number) => {
                                        const rulesForCombo = rules.filter(
                                            r =>
                                                (r as any).mode === combo.mode &&
                                                (r as any).movement === combo.movement &&
                                                (r as any).terms === combo.terms &&
                                                r.is_active
                                        )
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedMode(combo.mode)
                                                    setSelectedMovement(combo.movement)
                                                    setSelectedTerms(combo.terms)
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline">{combo.mode}</Badge>
                                                    <Badge variant="outline">{combo.movement}</Badge>
                                                    <Badge
                                                        variant={combo.terms === 'ALL_TERMS' ? 'default' : 'secondary'}
                                                    >
                                                        {combo.terms === 'ALL_TERMS' ? 'Universal' : combo.terms}
                                                    </Badge>
                                                </div>
                                                <div className="font-medium text-sm">{rulesForCombo.length} charges</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* All Charges Reference */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Available Charges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {charges.map(charge => (
                                        <div key={charge.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                                            <div className="font-medium text-sm">{charge.charge_code}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">{charge.charge_name}</div>
                                            <Badge variant={charge.is_active ? 'default' : 'secondary'} className="mt-2">
                                                {charge.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
