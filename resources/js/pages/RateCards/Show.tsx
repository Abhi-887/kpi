import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface RateLine {
  id: number
  charge_id: number
  charge?: { id: number; name: string }
  slab_min: number
  slab_max: number
  cost_rate: number
  currency_code: string
  is_fixed_rate: boolean
  uom_id: number
  uom?: { id: number; code: string }
}

interface VendorRateHeader {
  id: number
  vendor_id: number
  origin_port_id: number
  destination_port_id: number
  mode: string
  movement: string
  terms: string
  valid_from: string
  valid_upto: string
  is_active: boolean
  lines: RateLine[]
  vendor?: { id: number; name: string }
  originPort?: { id: number; code: string; name: string; city: string }
  destinationPort?: { id: number; code: string; name: string; city: string }
}

const modeColors: Record<string, string> = {
  AIR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  SEA: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200',
  ROAD: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  RAIL: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200',
  MULTIMODAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
}

const movementColors: Record<string, string> = {
  IMPORT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  EXPORT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  DOMESTIC: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
  INTER_MODAL: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
}

export default function ShowRateCard() {
  const { rate, lines } = usePage().props as any
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Rate Management', href: '/vendor-rates' },
    { title: `${rate.vendor_name}`, href: `/vendor-rates/${rate.id}` },
  ]

  const handleDelete = () => {
    router.delete(`/vendor-rates/${rate.id}`)
  }

  const isValidNow = new Date() >= new Date(rate.valid_from) && new Date() <= new Date(rate.valid_upto)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Rate Card - ${rate.vendor_name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{rate.vendor_name} - Rate Card</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {rate.origin_port} → {rate.destination_port} | {rate.mode} | {rate.movement}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/rate-cards/${rateHeader.id}/edit`}>
              <Button variant="default">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href="/rate-cards">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Header Details */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Card Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vendor</p>
                <p className="font-semibold">{rateHeader.vendor?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mode</p>
                <Badge className={modeColors[rateHeader.mode]}>{rateHeader.mode}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Movement</p>
                <Badge className={movementColors[rateHeader.movement]}>{rateHeader.movement}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Terms</p>
                <p className="font-semibold">{rateHeader.terms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Origin</p>
                <p className="font-semibold">{rateHeader.originPort?.code}</p>
                <p className="text-xs text-gray-500">{rateHeader.originPort?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
                <p className="font-semibold">{rateHeader.destinationPort?.code}</p>
                <p className="text-xs text-gray-500">{rateHeader.destinationPort?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid From</p>
                <p className="font-semibold">{new Date(rateHeader.valid_from).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid Until</p>
                <p className="font-semibold">{new Date(rateHeader.valid_upto).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant={rateHeader.is_active ? 'default' : 'secondary'}>
                    {rateHeader.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {isValidNow && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30">Currently Valid</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Lines ({rateHeader.lines.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rateHeader.lines.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No rate lines defined.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Charge</th>
                      <th className="px-4 py-3 text-left font-semibold">UOM</th>
                      <th className="px-4 py-3 text-left font-semibold">Slab Min</th>
                      <th className="px-4 py-3 text-left font-semibold">Slab Max</th>
                      <th className="px-4 py-3 text-left font-semibold">Cost Rate</th>
                      <th className="px-4 py-3 text-left font-semibold">Currency</th>
                      <th className="px-4 py-3 text-left font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rateHeader.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3 font-medium">{line.charge?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{line.uom?.code || 'N/A'}</td>
                        <td className="px-4 py-3">{line.slab_min}</td>
                        <td className="px-4 py-3">{line.slab_max}</td>
                        <td className="px-4 py-3 font-semibold">{line.cost_rate}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{line.currency_code}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={line.is_fixed_rate ? 'default' : 'secondary'}>
                            {line.is_fixed_rate ? 'Fixed' : 'Variable'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          {!showDeleteConfirm ? (
            <>
              <Link href={`/rate-cards/${rateHeader.id}/edit`}>
                <Button variant="default">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Rate Card
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-red-600 dark:text-red-400 py-2">Are you sure? This action cannot be undone.</p>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Confirm Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
