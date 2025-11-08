import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState, useEffect } from 'react'

interface Customer {
  id: number
  company_name: string
  email: string
  phone: string
}

interface Port {
  id: number
  code: string
  name: string
  city: string
  country: string
}

interface Location {
  id: number
  code: string
  name: string
  city: string
  country: string
}

interface User {
  id: number
  name: string
}

interface Dimension {
  id?: number
  length_cm: string
  width_cm: string
  height_cm: string
  pieces: string
  actual_weight_per_piece_kg: string
}

interface CreateProps {
  customers: Customer[]
  ports: Port[]
  locations: Location[]
  salespersons: User[]
}

interface QuotationFormData {
  customer_id: string
  mode: string
  movement: string
  terms: string
  origin_port_id: string
  destination_port_id: string
  origin_location_id: string
  destination_location_id: string
  salesperson_user_id: string
  notes: string
  dimensions: Dimension[]
}

interface CalculatedTotals {
  total_actual_weight: number
  total_cbm: number
  total_pieces: number
  total_chargeable_weight: number
  volumetric_divisor: number
}

export default function Create({ customers, ports, locations, salespersons }: CreateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quotations', href: '/quotations' },
    { title: 'Create', href: '/quotations/create' },
  ]

  const [totals, setTotals] = useState<CalculatedTotals>({
    total_actual_weight: 0,
    total_cbm: 0,
    total_pieces: 0,
    total_chargeable_weight: 0,
    volumetric_divisor: 167,
  })

  const { data, setData, post, processing, errors } = useForm<QuotationFormData>({
    customer_id: '',
    mode: 'AIR',
    movement: 'IMPORT',
    terms: 'FOB',
    origin_port_id: '',
    destination_port_id: '',
    origin_location_id: '',
    destination_location_id: '',
    salesperson_user_id: '',
    notes: '',
    dimensions: [
      {
        length_cm: '',
        width_cm: '',
        height_cm: '',
        pieces: '1',
        actual_weight_per_piece_kg: '',
      },
    ],
  })

  // Calculate totals whenever dimensions or mode changes
  useEffect(() => {
    calculateTotals()
  }, [data.dimensions, data.mode])

  const calculateTotals = () => {
    let totalActualWeight = 0
    let totalCbm = 0
    let totalPieces = 0

    data.dimensions.forEach((dim) => {
      if (dim.length_cm && dim.width_cm && dim.height_cm && dim.pieces && dim.actual_weight_per_piece_kg) {
        const l = parseFloat(dim.length_cm)
        const w = parseFloat(dim.width_cm)
        const h = parseFloat(dim.height_cm)
        const p = parseInt(dim.pieces)
        const weight = parseFloat(dim.actual_weight_per_piece_kg)

        // CBM per piece = (L * W * H) / 1,000,000
        const cbmPerPiece = (l * w * h) / 1_000_000
        const totalCbmForRow = cbmPerPiece * p

        // Total weight for row
        const totalWeightForRow = weight * p

        totalCbm += totalCbmForRow
        totalActualWeight += totalWeightForRow
        totalPieces += p
      }
    })

    // Get volumetric divisor
    const volumetricDivisor = getVolumetricDivisor(data.mode)

    // Volumetric weight = CBM * divisor
    const volumetricWeight = totalCbm * volumetricDivisor

    // Chargeable weight = MAX(actual_weight, volumetric_weight)
    const chargeableWeight = Math.max(totalActualWeight, volumetricWeight)

    setTotals({
      total_actual_weight: totalActualWeight,
      total_cbm: totalCbm,
      total_pieces: totalPieces,
      total_chargeable_weight: chargeableWeight,
      volumetric_divisor: volumetricDivisor,
    })
  }

  const getVolumetricDivisor = (mode: string): number => {
    switch (mode) {
      case 'AIR':
        return 167
      case 'SEA':
        return 1000
      case 'ROAD':
        return 300
      case 'RAIL':
        return 500
      default:
        return 167
    }
  }

  const addDimension = () => {
    setData('dimensions', [
      ...data.dimensions,
      {
        length_cm: '',
        width_cm: '',
        height_cm: '',
        pieces: '1',
        actual_weight_per_piece_kg: '',
      },
    ])
  }

  const removeDimension = (index: number) => {
    if (data.dimensions.length > 1) {
      setData(
        'dimensions',
        data.dimensions.filter((_, i) => i !== index)
      )
    }
  }

  const updateDimension = (index: number, field: keyof Dimension, value: string) => {
    const newDimensions = [...data.dimensions]
    newDimensions[index] = { ...newDimensions[index], [field]: value }
    setData('dimensions', newDimensions)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/quotations')
  }

  const saveAsDraft = (e: React.FormEvent) => {
    e.preventDefault()
    post('/quotations')
  }

  const getQuotation = (e: React.FormEvent) => {
    e.preventDefault()
    // Save and transition to costing
    post('/quotations', {
      onSuccess: (page) => {
        // Then prepare for costing
        // This will be handled by the controller redirect
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Quotation" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-6xl">
          <form onSubmit={submit} className="space-y-6">
            {/* Section 1: Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer *</label>
                  <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customer_id && <p className="mt-1 text-sm text-destructive">{errors.customer_id}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Salesperson</label>
                    <Select value={data.salesperson_user_id} onValueChange={(value) => setData('salesperson_user_id', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select salesperson" />
                      </SelectTrigger>
                      <SelectContent>
                        {salespersons.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Shipment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Mode *</label>
                    <Select value={data.mode} onValueChange={(value) => setData('mode', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AIR">Air</SelectItem>
                        <SelectItem value="SEA">Sea</SelectItem>
                        <SelectItem value="ROAD">Road</SelectItem>
                        <SelectItem value="RAIL">Rail</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.mode && <p className="mt-1 text-sm text-destructive">{errors.mode}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Movement *</label>
                    <Select value={data.movement} onValueChange={(value) => setData('movement', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMPORT">Import</SelectItem>
                        <SelectItem value="EXPORT">Export</SelectItem>
                        <SelectItem value="DOMESTIC">Domestic</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.movement && <p className="mt-1 text-sm text-destructive">{errors.movement}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Terms (Incoterms) *</label>
                    <Select value={data.terms} onValueChange={(value) => setData('terms', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXW">EXW</SelectItem>
                        <SelectItem value="FOB">FOB</SelectItem>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="CIP">CIP</SelectItem>
                        <SelectItem value="DDP">DDP</SelectItem>
                        <SelectItem value="DDU">DDU</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.terms && <p className="mt-1 text-sm text-destructive">{errors.terms}</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Origin Port *</label>
                    <Select value={data.origin_port_id} onValueChange={(value) => setData('origin_port_id', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select origin port" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem key={port.id} value={String(port.id)}>
                            {port.code} - {port.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.origin_port_id && <p className="mt-1 text-sm text-destructive">{errors.origin_port_id}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Destination Port *</label>
                    <Select value={data.destination_port_id} onValueChange={(value) => setData('destination_port_id', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select destination port" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem key={port.id} value={String(port.id)}>
                            {port.code} - {port.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.destination_port_id && <p className="mt-1 text-sm text-destructive">{errors.destination_port_id}</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Origin Location (Door-to-Door)</label>
                    <Select value={data.origin_location_id} onValueChange={(value) => setData('origin_location_id', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={String(location.id)}>
                            {location.code} - {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Destination Location (Door-to-Door)</label>
                    <Select
                      value={data.destination_location_id}
                      onValueChange={(value) => setData('destination_location_id', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={String(location.id)}>
                            {location.code} - {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Dimensions Grid */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Shipment Items (Dimensions)</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={addDimension}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left font-semibold">Length (cm)</th>
                        <th className="px-4 py-2 text-left font-semibold">Width (cm)</th>
                        <th className="px-4 py-2 text-left font-semibold">Height (cm)</th>
                        <th className="px-4 py-2 text-left font-semibold">Pieces</th>
                        <th className="px-4 py-2 text-left font-semibold">Weight/Piece (kg)</th>
                        <th className="px-4 py-2 text-left font-semibold">CBM</th>
                        <th className="px-4 py-2 text-left font-semibold">Total Weight (kg)</th>
                        <th className="px-4 py-2 text-center font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dimensions.map((dim, index) => {
                        const l = parseFloat(dim.length_cm) || 0
                        const w = parseFloat(dim.width_cm) || 0
                        const h = parseFloat(dim.height_cm) || 0
                        const p = parseInt(dim.pieces) || 0
                        const weight = parseFloat(dim.actual_weight_per_piece_kg) || 0

                        const cbmPerPiece = (l * w * h) / 1_000_000
                        const totalCbm = cbmPerPiece * p
                        const totalWeight = weight * p

                        return (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={dim.length_cm}
                                onChange={(e) => updateDimension(index, 'length_cm', e.target.value)}
                                placeholder="0.00"
                                className="dark:bg-gray-900/50"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={dim.width_cm}
                                onChange={(e) => updateDimension(index, 'width_cm', e.target.value)}
                                placeholder="0.00"
                                className="dark:bg-gray-900/50"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={dim.height_cm}
                                onChange={(e) => updateDimension(index, 'height_cm', e.target.value)}
                                placeholder="0.00"
                                className="dark:bg-gray-900/50"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="1"
                                value={dim.pieces}
                                onChange={(e) => updateDimension(index, 'pieces', e.target.value)}
                                placeholder="1"
                                className="dark:bg-gray-900/50"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={dim.actual_weight_per_piece_kg}
                                onChange={(e) => updateDimension(index, 'actual_weight_per_piece_kg', e.target.value)}
                                placeholder="0.00"
                                className="dark:bg-gray-900/50"
                              />
                            </td>
                            <td className="px-4 py-2 text-right font-mono">{totalCbm.toFixed(4)}</td>
                            <td className="px-4 py-2 text-right font-mono">{totalWeight.toFixed(2)}</td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeDimension(index)}
                                disabled={data.dimensions.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {errors.dimensions && (
                  <p className="mt-2 text-sm text-destructive">
                    {typeof errors.dimensions === 'string' ? errors.dimensions : 'Invalid dimensions'}
                  </p>
                )}

                {/* Totals Summary */}
                <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">Calculated Totals</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Total Pieces</p>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{totals.total_pieces}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Total Weight</p>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{totals.total_actual_weight.toFixed(2)} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Total CBM</p>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{totals.total_cbm.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Chargeable Weight</p>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{totals.total_chargeable_weight.toFixed(2)} kg</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        (÷{totals.volumetric_divisor} = {(totals.total_cbm * totals.volumetric_divisor).toFixed(2)} kg vol.)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Any special requirements or notes for this quotation..."
                    className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full dark:bg-gray-900 dark:border-gray-700"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href="/quotations">
                <Button type="button" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="outline" disabled={processing}>
                {processing ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                disabled={processing || !data.customer_id || totals.total_chargeable_weight <= 0}
                onClick={(e) => {
                  // Save and prepare for costing
                  e.preventDefault()
                  post('/quotations', {
                    data: { ...data },
                    onSuccess: (page) => {
                      // After creation, prepare for costing
                      // The controller will handle the redirect
                    },
                  })
                }}
              >
                {processing ? 'Processing...' : 'Get Costs →'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
