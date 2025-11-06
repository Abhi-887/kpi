import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { router } from '@inertiajs/react'
import { useState } from 'react'

interface PricingCharge {
  id: number
  name: string
  charge_type: string
  amount: string
  description: string
  is_optional: boolean
  apply_order: number
  status: string
}

interface RateCard {
  id: number
  name: string
  description: string
  status: string
  service_type: string
  origin_country: string
  destination_country: string
  base_rate: string
  minimum_charge: string
  surcharge_percentage: string
  is_zone_based: boolean
  valid_days: number
  charges: PricingCharge[]
}

interface ShowRateCardProps {
  rateCard: RateCard
}

export default function ShowRateCard({ rateCard }: ShowRateCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Rate Cards',
      href: '/rate-cards',
    },
    {
      title: rateCard.name,
      href: `/rate-cards/${rateCard.id}`,
    },
  ]

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }

  const serviceTypeColors: Record<string, string> = {
    standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    express: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    overnight: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    economy: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  }

  const chargeTypeColors: Record<string, string> = {
    fixed: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    percentage: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    weight_based: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this rate card? This action cannot be undone.')) {
      setIsDeleting(true)
      router.delete(`/rate-cards/${rateCard.id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={rateCard.name} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-4xl">
          {/* Header with Actions */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{rateCard.name}</h1>
              {rateCard.description && <p className="text-muted-foreground">{rateCard.description}</p>}
            </div>
            <div className="flex gap-2">
              <Link href={`/rate-cards/${rateCard.id}/edit`}>
                <Button variant="default" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Link href="/rate-cards">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>

          {/* Basic Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={statusColors[rateCard.status]}>{rateCard.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Service Type</p>
                  <Badge className={serviceTypeColors[rateCard.service_type]}>{rateCard.service_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valid Days</p>
                  <p className="font-semibold">{rateCard.valid_days} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Zone Based Pricing</p>
                  <p className="font-semibold">{rateCard.is_zone_based ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Origin</p>
                  <p className="font-semibold text-lg">{rateCard.origin_country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Destination</p>
                  <p className="font-semibold text-lg">{rateCard.destination_country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Base Rate (per kg)</p>
                  <p className="font-semibold text-lg">₹{parseFloat(String(rateCard.base_rate)).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Minimum Charge</p>
                  <p className="font-semibold text-lg">₹{parseFloat(String(rateCard.minimum_charge)).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Surcharge</p>
                  <p className="font-semibold text-lg">{parseFloat(String(rateCard.surcharge_percentage)).toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Charges Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Charges ({rateCard.charges.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {rateCard.charges.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Optional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateCard.charges.map((charge, idx) => (
                        <tr key={charge.id} className={idx % 2 === 0 ? 'bg-muted/50 dark:bg-gray-900/30' : ''}>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{charge.name}</p>
                              {charge.description && <p className="text-sm text-muted-foreground">{charge.description}</p>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={chargeTypeColors[charge.charge_type]}>{charge.charge_type}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {charge.charge_type === 'percentage'
                              ? `${parseFloat(String(charge.amount)).toFixed(2)}%`
                              : `₹${parseFloat(String(charge.amount)).toFixed(2)}`}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={charge.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}>
                              {charge.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{charge.is_optional ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No pricing charges defined for this rate card.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
