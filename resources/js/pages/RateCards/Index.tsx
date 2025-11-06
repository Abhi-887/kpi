import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Download, Plus, Search, Trash2 } from 'lucide-react'
import { Head } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
}

const serviceTypeColors: Record<string, string> = {
  standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  express: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  overnight: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  economy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
}

interface RateCard {
  id: number
  name: string
  status: string
  service_type: string
  origin_country: string
  destination_country: string
  base_rate: number
  minimum_charge: number
  charges_count: number
}

interface PaginatedResponse {
  data: RateCard[]
  total: number
  current_page: number
  last_page: number
  prev_page_url?: string
  next_page_url?: string
}

interface PageProps {
  rateCards: PaginatedResponse
  filters: Record<string, any>
}

export default function RateCardsIndex() {
  const { rateCards, filters } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Rate Cards',
      href: '/rate-cards',
    },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [serviceType, setServiceType] = useState(filters.service_type || '')
  const [perPage, setPerPage] = useState(filters.per_page || 50)

  const handleSearch = () => {
    router.get(
      '/rate-cards',
      {
        search,
        status,
        service_type: serviceType,
        per_page: perPage,
      },
      { preserveScroll: true }
    )
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setServiceType('')
    setPerPage(50)
    router.get('/rate-cards', { per_page: 50 }, { preserveScroll: true })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rate Cards" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Name, country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="sm" variant="default">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type</label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="overnight">Overnight</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Per Page */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Per Page</label>
                <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="default">
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
              <Link href="/rate-cards/create" className="ml-auto">
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rate Card
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <strong>{rateCards.data.length}</strong> of <strong>{rateCards.total}</strong> rate cards
          </p>
        </div>

        {/* Rate Cards Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Base Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Charges
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rateCards.data.map((rateCard: RateCard) => (
                    <tr key={rateCard.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-sm">{rateCard.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {rateCard.origin_country} → {rateCard.destination_country}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${serviceTypeColors[rateCard.service_type]}`}>
                          {rateCard.service_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        ₹{parseFloat(String(rateCard.base_rate)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${statusColors[rateCard.status]}`}>
                          {rateCard.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">{rateCard.charges_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            href={`/rate-cards/${rateCard.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View
                          </Link>
                          <Link
                            href={`/rate-cards/${rateCard.id}/edit`}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-medium"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {rateCards.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {rateCards.current_page} of {rateCards.last_page}
            </p>
            <div className="flex gap-2">
              {rateCards.prev_page_url && (
                <Link href={rateCards.prev_page_url} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/50">
                  Previous
                </Link>
              )}
              {rateCards.next_page_url && (
                <Link href={rateCards.next_page_url} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/50">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
