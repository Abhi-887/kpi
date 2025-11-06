import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Download, FileText, Printer } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { router } from '@inertiajs/react'

interface QuoteItem {
  id: number
  name: string
  charge_type: string
  amount: string
  is_optional: boolean
  status: string
}

interface Quote {
  id: number
  reference_number: string
  origin_country: string
  destination_country: string
  service_type: string
  weight: string
  weight_unit: string
  base_cost: string
  charges_total: string
  surcharge: string
  total_cost: string
  currency: string
  total_in_currency: string
  status: string
  valid_until: string
  notes: string | null
  created_at: string
  created_by: { name: string }
  items: QuoteItem[]
}

interface ShowProps {
  quote: Quote
}

export default function Show({ quote }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Quotes',
      href: '/quotes',
    },
    {
      title: quote.reference_number,
      href: `/quotes/${quote.id}`,
    },
  ]

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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
    if (confirm('Are you sure? This cannot be undone.')) {
      router.delete(`/quotes/${quote.id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={quote.reference_number} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{quote.reference_number}</h1>
                <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Created by {quote.created_by.name} on {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
              <Link href="/quotes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>

          {/* Route Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">From</p>
                  <p className="font-semibold text-lg">{quote.origin_country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">To</p>
                  <p className="font-semibold text-lg">{quote.destination_country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Service Type</p>
                  <Badge className={serviceTypeColors[quote.service_type]}>{quote.service_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Weight</p>
                  <p className="font-semibold">
                    {quote.weight} {quote.weight_unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Base Cost</span>
                  <span className="font-semibold">₹{parseFloat(String(quote.base_cost)).toFixed(2)}</span>
                </div>
                {parseFloat(String(quote.surcharge)) > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Surcharge</span>
                    <span className="font-semibold">₹{parseFloat(String(quote.surcharge)).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(String(quote.charges_total)) > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Additional Charges</span>
                    <span className="font-semibold">₹{parseFloat(String(quote.charges_total)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 text-lg font-bold bg-blue-50 dark:bg-blue-900/20 px-3 rounded">
                  <span>Total (INR)</span>
                  <span>₹{parseFloat(String(quote.total_cost)).toFixed(2)}</span>
                </div>
                {quote.currency !== 'INR' && (
                  <div className="flex justify-between py-3 text-lg font-bold bg-green-50 dark:bg-green-900/20 px-3 rounded">
                    <span>Total ({quote.currency})</span>
                    <span>{quote.total_in_currency}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charges Details */}
          {quote.items.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Charges Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/50 dark:bg-gray-900/30' : ''}>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4">
                            <Badge className={chargeTypeColors[item.charge_type]}>{item.charge_type}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {item.charge_type === 'percentage'
                              ? `${parseFloat(String(item.amount)).toFixed(2)}%`
                              : `₹${parseFloat(String(item.amount)).toFixed(2)}`}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={item.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
