import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import { Head, Link, router } from '@inertiajs/react'
import { ArrowLeft, Edit, FileText, Send, Trash2 } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface QuotationData {
  id: number
  quote_id: string
  quote_status: string
  customer: { id: number; company_name: string; email: string; phone: string }
  created_by: { id: number; name: string }
  salesperson: { id: number; name: string } | null
  mode: string
  movement: string
  terms: string
  origin_port_id: number
  destination_port_id: number
  origin_location_id: number | null
  destination_location_id: number | null
  total_chargeable_weight: number | string
  total_cbm: number | string
  total_pieces: number
  dimensions: Array<{
    id: number
    length_cm: number
    width_cm: number
    height_cm: number
    pieces: number
    actual_weight_per_piece_kg: number
  }>
  originPort?: {
    id: number
    code: string
    name: string
    city: string
    country: string
  }
  destinationPort?: {
    id: number
    code: string
    name: string
    city: string
    country: string
  }
  notes: string | null
  created_at: string
  updated_at: string
}

interface ShowProps {
  quotation: QuotationData
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  pending_costing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pending_approval: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400',
}

const modeColors: Record<string, string> = {
  AIR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SEA: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  ROAD: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  RAIL: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
}

export default function Show({ quotation }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quotations', href: '/quotations' },
    { title: quotation.quote_id, href: '#' },
  ]

  const handleGetCosts = () => {
    router.post(`/quotations/${quotation.id}/prepare-for-costing`, {}, { onSuccess: () => router.visit(`/quotations/${quotation.id}/costing`) })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      router.delete(`/quotations/${quotation.id}`, { onSuccess: () => router.visit('/quotations') })
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Quotation ${quotation.quote_id}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{quotation.quote_id}</h1>
              <p className="text-muted-foreground mt-1">{quotation.customer.company_name}</p>
            </div>
            <Badge className={statusColors[quotation.quote_status] || statusColors.Draft}>{quotation.quote_status}</Badge>
          </div>

          {/* Client Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-semibold">{quotation.customer.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-semibold">{quotation.customer.email}</p>
                <p className="text-sm">{quotation.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salesperson</p>
                <p className="font-semibold">{quotation.salesperson?.name || 'Not assigned'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Mode</p>
                <Badge className={modeColors[quotation.mode]}>{quotation.mode}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Movement</p>
                <p className="font-semibold">{quotation.movement}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terms (Incoterms)</p>
                <p className="font-semibold">{quotation.terms}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold text-sm">{new Date(quotation.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Route Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Route</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Origin Port</p>
                  <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="font-mono font-semibold">{quotation.originPort?.code || 'N/A'}</p>
                    <p className="text-sm">{quotation.originPort?.name || ''}</p>
                    <p className="text-xs text-muted-foreground">
                      {quotation.originPort?.city}, {quotation.originPort?.country}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Destination Port</p>
                  <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="font-mono font-semibold">{quotation.destinationPort?.code || 'N/A'}</p>
                    <p className="text-sm">{quotation.destinationPort?.name || ''}</p>
                    <p className="text-xs text-muted-foreground">
                      {quotation.destinationPort?.city}, {quotation.destinationPort?.country}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions Grid */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Shipment Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold">Length (cm)</th>
                      <th className="px-4 py-3 text-left font-semibold">Width (cm)</th>
                      <th className="px-4 py-3 text-left font-semibold">Height (cm)</th>
                      <th className="px-4 py-3 text-center font-semibold">Pieces</th>
                      <th className="px-4 py-3 text-right font-semibold">Weight/Piece (kg)</th>
                      <th className="px-4 py-3 text-right font-semibold">CBM</th>
                      <th className="px-4 py-3 text-right font-semibold">Total Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.dimensions.map((dim, idx) => {
                      const cbmPerPiece = (dim.length_cm * dim.width_cm * dim.height_cm) / 1_000_000
                      const totalCbm = cbmPerPiece * dim.pieces
                      const totalWeight = dim.actual_weight_per_piece_kg * dim.pieces
                      return (
                        <tr key={dim.id} className={idx % 2 === 0 ? 'bg-muted/50 dark:bg-gray-900/30' : ''}>
                          <td className="px-4 py-3 font-mono">{dim.length_cm.toFixed(2)}</td>
                          <td className="px-4 py-3 font-mono">{dim.width_cm.toFixed(2)}</td>
                          <td className="px-4 py-3 font-mono">{dim.height_cm.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-mono">{dim.pieces}</td>
                          <td className="px-4 py-3 text-right font-mono">{dim.actual_weight_per_piece_kg.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-mono">{totalCbm.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">{totalWeight.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/70 font-semibold">
                      <td colSpan={3} className="px-4 py-3 text-right">
                        TOTALS
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{quotation.total_pieces}</td>
                      <td />
                      <td className="px-4 py-3 text-right font-mono">{Number(quotation.total_cbm).toFixed(4)}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {quotation.dimensions.reduce((sum, dim) => sum + dim.actual_weight_per_piece_kg * dim.pieces, 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td colSpan={6} className="px-4 py-3 text-right font-semibold">
                        Chargeable Weight:
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {Number(quotation.total_chargeable_weight).toFixed(2)} kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/quotations">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            {quotation.quote_status === 'Draft' && (
              <>
                <Link href={`/quotations/${quotation.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button onClick={handleGetCosts} className="bg-green-600 hover:bg-green-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Get Costs →
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}

            {quotation.quote_status === 'Pending Costing' && (
              <Link href={`/quotations/${quotation.id}/costing`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="mr-2 h-4 w-4" />
                  View Costing Grid →
                </Button>
              </Link>
            )}

            {(quotation.quote_status === 'Pending Approval' || quotation.quote_status === 'Won') && (
              <Button disabled className="opacity-50">
                <Send className="mr-2 h-4 w-4" />
                Send to Customer
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
