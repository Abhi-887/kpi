import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
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

interface QuotationData {
  id: number
  quote_id: string
  customer_id: number
  mode: string
  movement: string
  terms: string
  origin_port_id: number
  destination_port_id: number
  origin_location_id: number | null
  destination_location_id: number | null
  salesperson_user_id: number | null
  notes: string | null
  dimensions: Array<{
    id?: number
    length_cm: number
    width_cm: number
    height_cm: number
    pieces: number
    actual_weight_per_piece_kg: number
  }>
}

interface EditProps {
  quotation: QuotationData
  customers: Customer[]
  ports: Port[]
  locations: Location[]
  salespersons: User[]
}

export default function Edit({ quotation, customers, ports, locations, salespersons }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quotations', href: '/quotations' },
    { title: quotation.quote_id, href: `/quotations/${quotation.id}` },
    { title: 'Edit', href: '#' },
  ]

  const { data, setData, patch, processing, errors } = useForm({
    customer_id: String(quotation.customer_id),
    mode: quotation.mode,
    movement: quotation.movement,
    terms: quotation.terms,
    origin_port_id: String(quotation.origin_port_id),
    destination_port_id: String(quotation.destination_port_id),
    origin_location_id: String(quotation.origin_location_id || ''),
    destination_location_id: String(quotation.destination_location_id || ''),
    salesperson_user_id: String(quotation.salesperson_user_id || ''),
    notes: quotation.notes || '',
    dimensions: quotation.dimensions.map((d) => ({
      length_cm: String(d.length_cm),
      width_cm: String(d.width_cm),
      height_cm: String(d.height_cm),
      pieces: String(d.pieces),
      actual_weight_per_piece_kg: String(d.actual_weight_per_piece_kg),
    })),
  })

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
    patch(`/quotations/${quotation.id}`)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Quotation" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-6xl">
          <form onSubmit={submit} className="space-y-6">
            {/* Shipment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Mode</label>
                    <Select value={data.mode} onValueChange={(value: string) => setData('mode', value)}>
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
                  </div>

                  <div>
                    <label className="text-sm font-medium">Movement</label>
                    <Select value={data.movement} onValueChange={(value: string) => setData('movement', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMPORT">Import</SelectItem>
                        <SelectItem value="EXPORT">Export</SelectItem>
                        <SelectItem value="DOMESTIC">Domestic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Terms</label>
                    <Select value={data.terms} onValueChange={(value: string) => setData('terms', value)}>
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions Grid */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Shipment Items</CardTitle>
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
                        <th className="px-4 py-2 text-center font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dimensions.map((dim, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={dim.length_cm}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDimension(index, 'length_cm', e.target.value)}
                              className="dark:bg-gray-900/50"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={dim.width_cm}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDimension(index, 'width_cm', e.target.value)}
                              className="dark:bg-gray-900/50"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={dim.height_cm}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDimension(index, 'height_cm', e.target.value)}
                              className="dark:bg-gray-900/50"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              min="1"
                              value={dim.pieces}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDimension(index, 'pieces', e.target.value)}
                              className="dark:bg-gray-900/50"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={dim.actual_weight_per_piece_kg}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDimension(index, 'actual_weight_per_piece_kg', e.target.value)}
                              className="dark:bg-gray-900/50"
                            />
                          </td>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                    placeholder="Any special requirements or notes..."
                    className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full dark:bg-gray-900 dark:border-gray-700"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href={`/quotations/${quotation.id}`}>
                <Button type="button" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
