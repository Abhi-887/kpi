import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { Link, router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type BreadcrumbItem } from '@/types'

const statusColors: Record<string, string> = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  false: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
}

const serviceTypeColors: Record<string, string> = {
  standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  express: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  overnight: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  economy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
}

interface CourierPrice {
  id: number
  name: string
  carrier_name: string
  service_type: string
  base_price: number
  coverage_area: string
  is_active: boolean
}

export default function CourierPricesIndex() {
  const { courierPrices, filters } = usePage().props as any
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [serviceType, setServiceType] = useState(filters.service_type || '')
  const [perPage, setPerPage] = useState(filters.per_page || 50)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Courier Prices', href: '/courier-prices' },
  ]

  const handleSearch = () => {
    router.get(
      '/courier-prices',
      { search, status, service_type: serviceType, per_page: perPage },
      { preserveScroll: true }
    )
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setServiceType('')
    setPerPage(50)
    router.get('/courier-prices', { per_page: 50 }, { preserveScroll: true })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this courier price?')) {
      router.delete(`/courier-prices/${id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Courier Prices" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Name, carrier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="sm" variant="default">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

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

              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} variant="default" className="w-full">
                  Apply
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
              <Link href="/courier-prices/create" className="ml-auto">
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Courier Price
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <strong>{courierPrices.data.length}</strong> of <strong>{courierPrices.total}</strong> courier prices
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Carrier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Base Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Coverage Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courierPrices.data.map((price: CourierPrice) => (
                    <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold">{price.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm">{price.carrier_name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className={`${serviceTypeColors[price.service_type]}`}>{price.service_type}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold">
                        ₹{parseFloat(String(price.base_price)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{price.coverage_area}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className={`${statusColors[String(price.is_active)]}`}>
                          {price.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/courier-prices/${price.id}/edit`}
                            className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(price.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
        {courierPrices.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {courierPrices.current_page} of {courierPrices.last_page}
            </p>
            <div className="flex gap-2">
              {courierPrices.prev_page_url && (
                <Link href={courierPrices.prev_page_url} className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-900/50">
                  Previous
                </Link>
              )}
              {courierPrices.next_page_url && (
                <Link href={courierPrices.next_page_url} className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-900/50">
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
