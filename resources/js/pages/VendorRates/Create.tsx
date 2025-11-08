import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'

interface Supplier {
  id: number
  name: string
}

interface Location {
  id: number
  code: string
  name: string
  type: string
}

interface Charge {
  id: number
  charge_code?: string
  charge_name?: string
  name?: string
}

interface UnitOfMeasure {
  id: number
  code: string
  name: string
}

interface PageProps {
  suppliers: Supplier[]
  locations: Location[]
  charges: Charge[]
  uoms: UnitOfMeasure[]
  errors: Record<string, string>
}

interface RateLine {
  charge_id: number
  slab_min: number
  slab_max: number
  cost_rate: number
  currency_code: string
  is_fixed_rate: boolean
  uom_id: number
}

export default function CreateRateCard() {
  const props = usePage().props as any
  const suppliers = props.vendors || []
  const locations = props.locations || []
  const charges = props.charges || []
  const uoms = props.uoms || []
  const errors = props.errors || {}
  
  const [lines, setLines] = useState<RateLine[]>([])
  const [formData, setFormData] = useState({
    vendor_id: '',
    origin_port_id: '',
    destination_port_id: '',
    mode: 'AIR',
    movement: 'EXPORT',
    terms: 'FOB',
    valid_from: new Date().toISOString().split('T')[0],
    valid_upto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Rate Management', href: '/vendor-rates' },
    { title: 'Create Rate Card', href: '/vendor-rates/create' },
  ]

  const handleLineAdd = () => {
    setLines([...lines, {
      charge_id: 0,
      slab_min: 0,
      slab_max: 100,
      cost_rate: 0,
      currency_code: 'USD',
      is_fixed_rate: false,
      uom_id: 0,
    }])
  }

  const handleLineRemove = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleLineChange = (index: number, key: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [key]: value }
    setLines(newLines)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.post('/vendor-rates', {
      ...formData,
      lines: lines.map(line => ({
        ...line,
        charge_id: Number(line.charge_id),
        uom_id: Number(line.uom_id),
        slab_min: Number(line.slab_min),
        slab_max: Number(line.slab_max),
        cost_rate: Number(line.cost_rate),
      })),
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Rate Card" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Rate Card</h1>
          <Link href="/rate-cards">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Card Header</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vendor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vendor *</label>
                  <Select value={formData.vendor_id} onValueChange={(val) => setFormData({ ...formData, vendor_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendor_id && <p className="text-xs text-red-600">{errors.vendor_id}</p>}
                </div>

                {/* Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode *</label>
                  <Select value={formData.mode} onValueChange={(val) => setFormData({ ...formData, mode: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AIR">Air</SelectItem>
                      <SelectItem value="SEA">Sea</SelectItem>
                      <SelectItem value="ROAD">Road</SelectItem>
                      <SelectItem value="RAIL">Rail</SelectItem>
                      <SelectItem value="MULTIMODAL">Multimodal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Movement */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Movement *</label>
                  <Select value={formData.movement} onValueChange={(val) => setFormData({ ...formData, movement: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMPORT">Import</SelectItem>
                      <SelectItem value="EXPORT">Export</SelectItem>
                      <SelectItem value="DOMESTIC">Domestic</SelectItem>
                      <SelectItem value="INTER_MODAL">Inter-modal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Terms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Terms *</label>
                  <Select value={formData.terms} onValueChange={(val) => setFormData({ ...formData, terms: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXW">EXW</SelectItem>
                      <SelectItem value="FCA">FCA</SelectItem>
                      <SelectItem value="CPT">CPT</SelectItem>
                      <SelectItem value="CIP">CIP</SelectItem>
                      <SelectItem value="DAP">DAP</SelectItem>
                      <SelectItem value="DDP">DDP</SelectItem>
                      <SelectItem value="FOB">FOB</SelectItem>
                      <SelectItem value="CFR">CFR</SelectItem>
                      <SelectItem value="CIF">CIF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Origin Port */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origin Port *</label>
                  <Select value={formData.origin_port_id} onValueChange={(val) => setFormData({ ...formData, origin_port_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>{l.code} - {l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.origin_port_id && <p className="text-xs text-red-600">{errors.origin_port_id}</p>}
                </div>

                {/* Destination Port */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination Port *</label>
                  <Select value={formData.destination_port_id} onValueChange={(val) => setFormData({ ...formData, destination_port_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>{l.code} - {l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destination_port_id && <p className="text-xs text-red-600">{errors.destination_port_id}</p>}
                </div>

                {/* Valid From */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid From *</label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                  {errors.valid_from && <p className="text-xs text-red-600">{errors.valid_from}</p>}
                </div>

                {/* Valid Upto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid Upto *</label>
                  <Input
                    type="date"
                    value={formData.valid_upto}
                    onChange={(e) => setFormData({ ...formData, valid_upto: e.target.value })}
                  />
                  {errors.valid_upto && <p className="text-xs text-red-600">{errors.valid_upto}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Lines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rate Lines</CardTitle>
              <Button type="button" onClick={handleLineAdd} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </CardHeader>
            <CardContent>
              {lines.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No rate lines added. Click "Add Line" to start.</p>
              ) : (
                <div className="space-y-3 overflow-x-auto">
                  <div className="min-w-full inline-block">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Charge</th>
                          <th className="px-3 py-2 text-left font-medium">UOM</th>
                          <th className="px-3 py-2 text-left font-medium">Slab Min</th>
                          <th className="px-3 py-2 text-left font-medium">Slab Max</th>
                          <th className="px-3 py-2 text-left font-medium">Cost Rate</th>
                          <th className="px-3 py-2 text-left font-medium">Currency</th>
                          <th className="px-3 py-2 text-left font-medium">Fixed</th>
                          <th className="px-3 py-2 text-center font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {lines.map((line, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">
                              <select
                                value={line.charge_id}
                                onChange={(e) => handleLineChange(idx, 'charge_id', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              >
                                <option value="">Select Charge</option>
                                {charges.map(c => (
                                  <option key={c.id} value={c.id}>{c.charge_name || c.name || 'N/A'}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={line.uom_id}
                                onChange={(e) => handleLineChange(idx, 'uom_id', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              >
                                <option value="">Select UOM</option>
                                {uoms.map(u => (
                                  <option key={u.id} value={u.id}>{u.symbol} - {u.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={line.slab_min}
                                onChange={(e) => handleLineChange(idx, 'slab_min', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={line.slab_max}
                                onChange={(e) => handleLineChange(idx, 'slab_max', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={line.cost_rate}
                                onChange={(e) => handleLineChange(idx, 'cost_rate', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={line.currency_code}
                                onChange={(e) => handleLineChange(idx, 'currency_code', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                                <option value="AUD">AUD</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={line.is_fixed_rate}
                                onChange={(e) => handleLineChange(idx, 'is_fixed_rate', e.target.checked)}
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleLineRemove(idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="default">
              Create Rate Card
            </Button>
            <Link href="/vendor-rates">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
