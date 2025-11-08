import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/layouts/app-layout'
import { Head, useForm, router } from '@inertiajs/react'
import { ArrowLeft, Save, TrendingDown, AlertCircle } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface Quotation {
  quote_id: string
  customer_name: string
  mode: string
  movement: string
  total_chargeable_weight: number
  total_cbm: number
}

interface VendorOption {
  vendor_id: number
  vendor_name: string
  cost: number
  is_current_selection: boolean
  is_rank_1: boolean
}

interface GridRow {
  id: number
  charge_id: number
  charge_name: string
  charge_code: string
  selected_vendor_id: number
  selected_vendor_name: string
  total_cost_inr: number
  is_rank_1: boolean
  vendor_options: VendorOption[]
  notes: string
}

interface CostingGridData {
  quote_id: string
  customer_name: string
  mode: string
  movement: string
  total_chargeable_weight: number
  total_cbm: number
  grid_rows: GridRow[]
  grand_total_inr: number
  rank_1_count: number
  overridden_count: number
}

interface CostingProps {
  quotation: Quotation
  gridData: CostingGridData
}

export default function Costing({ quotation, gridData }: CostingProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quotations', href: '/quotations' },
    { title: quotation.quote_id, href: `/quotations/${quotation.id}` },
    { title: 'Costing & Comparison', href: '#' },
  ]

  const [rows, setRows] = useState<GridRow[]>(gridData.grid_rows)
  const [selectedOverrides, setSelectedOverrides] = useState<Record<number, { vendor_id: number; cost: number }>>({})
  const { post, processing } = useForm()

  const updateRowVendor = (rowId: number, vendorId: number, cost: number) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, selected_vendor_id: vendorId, total_cost_inr: cost } : row))
    )
    setSelectedOverrides((prev) => ({ ...prev, [rowId]: { vendor_id: vendorId, cost } }))
  }

  const finalizeCosts = () => {
    // Submit all vendor selections via API
    Object.entries(selectedOverrides).forEach(([costLineId, { vendor_id, cost }]) => {
      router.patch(`/api/cost-lines/${costLineId}/update-vendor`, {
        selected_vendor_id: vendor_id,
        unit_cost_rate: cost,
      })
    })

    // Then finalize
    post(`/quotations/${quotation.id}/costing/finalize`)
  }

  const calculateCostPerKg = (cost: number) => {
    return quotation.total_chargeable_weight > 0 ? (cost / quotation.total_chargeable_weight).toFixed(4) : '0'
  }

  const currentTotal = rows.reduce((sum, row) => sum + row.total_cost_inr, 0)
  const rank1Total = rows
    .filter((row) => row.is_rank_1)
    .reduce((sum, row) => sum + row.total_cost_inr, 0)
  const savingsIfAllRank1 = currentTotal - rank1Total

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Costing & Comparison" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="w-full">
          {/* Header Summary */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{gridData.quote_id}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {gridData.customer_name} • {gridData.mode} • {gridData.movement}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Shipment Totals</p>
                  <p className="text-sm font-mono">
                    {gridData.total_chargeable_weight.toFixed(2)} kg • {gridData.total_cbm.toFixed(4)} CBM
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Charges</p>
                <p className="text-2xl font-bold">{rows.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Current Total</p>
                <p className="text-2xl font-bold">₹{currentTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">₹{calculateCostPerKg(currentTotal)}/kg</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Rank 1 Selected</p>
                <p className="text-2xl font-bold">
                  {rows.filter((r) => r.is_rank_1).length}/{rows.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{gridData.rank_1_count} cheapest rates</p>
              </CardContent>
            </Card>
            <Card className={savingsIfAllRank1 > 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <p className={`text-2xl font-bold ${savingsIfAllRank1 > 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  ₹{savingsIfAllRank1.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">If all Rank 1</p>
              </CardContent>
            </Card>
          </div>

          {/* Costing Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Comparison Grid</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Green = Rank 1 (Cheapest) | Review and select vendors for each charge
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold">Charge Code</th>
                      <th className="px-4 py-3 text-left font-semibold">Charge Name</th>
                      <th className="px-4 py-3 text-center font-semibold">Vendor Options</th>
                      <th className="px-4 py-3 text-right font-semibold">Selected Vendor</th>
                      <th className="px-4 py-3 text-right font-semibold">Cost (INR)</th>
                      <th className="px-4 py-3 text-right font-semibold">₹/kg</th>
                      <th className="px-4 py-3 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`border-b hover:bg-muted/50 transition-colors ${
                          row.is_rank_1 ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs">{row.charge_code}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{row.charge_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {row.vendor_options.map((vendor) => (
                              <Badge
                                key={vendor.vendor_id}
                                className={`cursor-pointer transition-all ${
                                  vendor.is_current_selection
                                    ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                                    : vendor.is_rank_1
                                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                                      : 'bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => updateRowVendor(row.id, vendor.vendor_id, vendor.cost)}
                                title={`₹${vendor.cost.toFixed(2)} - Click to select`}
                              >
                                <span className="text-xs">
                                  {vendor.vendor_name.substring(0, 10)}
                                  {vendor.is_rank_1 && ' ✓'}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{row.selected_vendor_name}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          ₹{row.total_cost_inr.toFixed(2)}
                          {row.is_rank_1 && (
                            <Badge className="ml-2 bg-green-600">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Rank 1
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">₹{calculateCostPerKg(row.total_cost_inr)}</td>
                        <td className="px-4 py-3 text-center">
                          {!row.is_rank_1 && (
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Override
                            </Badge>
                          )}
                          {row.is_rank_1 && <Badge className="bg-green-600">Cheapest</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/70 font-semibold">
                      <td colSpan={4} className="px-4 py-3 text-right">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-right font-mono">₹{currentTotal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">₹{calculateCostPerKg(currentTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {savingsIfAllRank1 > 0 && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-300">
                      Potential Savings: ₹{savingsIfAllRank1.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Switch {gridData.overridden_count} overridden selections to Rank 1 (cheapest) to save
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => router.visit(`/quotations/${quotation.id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={finalizeCosts} disabled={processing} className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              {processing ? 'Finalizing...' : 'Finalize Costs'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
