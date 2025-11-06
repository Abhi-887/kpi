import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import { Link, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface ComparisonItem {
  id: number
  service_name: string
  our_rate: number
  competitor_rate: number
  difference: number
  status: string
}

interface Comparison {
  id: number
  login_id: string
  our_price: number
  competitor_price: number
  price_difference: number
  status: string
  notes?: string
  items: ComparisonItem[]
  rate_card?: { id: number; name: string }
  user?: { name: string }
}

interface Props {
  comparison: Comparison
}

const statusColors: Record<string, string> = {
  favorable: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  unfavorable: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
}

export default function ShowPriceComparison({ comparison }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Price Comparisons', href: '/price-comparisons' },
    { title: comparison.login_id, href: '#' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Price Comparison - ${comparison.login_id}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{comparison.login_id}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comparison Details</p>
            </div>
            <Badge className={statusColors[comparison.status]}>{comparison.status}</Badge>
          </div>

          {/* Overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Our Price</div>
                  <div className="text-3xl font-bold">₹{parseFloat(String(comparison.our_price)).toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Competitor Price</div>
                  <div className="text-3xl font-bold">₹{parseFloat(String(comparison.competitor_price)).toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Difference</div>
                  <div className={`text-3xl font-bold ${
                    (comparison.price_difference as any) < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    ₹{parseFloat(String(comparison.price_difference)).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Comparison Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Rate Card</div>
                  <div className="text-lg font-semibold">{comparison.rate_card?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Created By</div>
                  <div className="text-lg font-semibold">{comparison.user?.name || 'N/A'}</div>
                </div>
              </div>

              {comparison.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</div>
                  <p className="mt-1 text-sm">{comparison.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          {comparison.items && comparison.items.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Comparison Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Service Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Our Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Competitor Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Difference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {comparison.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="px-6 py-4 font-medium">{item.service_name}</td>
                          <td className="whitespace-nowrap px-6 py-4">₹{parseFloat(String(item.our_rate)).toFixed(2)}</td>
                          <td className="whitespace-nowrap px-6 py-4">₹{parseFloat(String(item.competitor_rate)).toFixed(2)}</td>
                          <td className={`whitespace-nowrap px-6 py-4 ${parseFloat(String(item.difference)) < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ₹{parseFloat(String(item.difference)).toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <Badge>{item.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back Link */}
          <div className="flex gap-2">
            <Link href="/price-comparisons" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Comparisons
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
