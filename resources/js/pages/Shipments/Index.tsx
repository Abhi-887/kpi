import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { ChevronDown, Download, Search } from 'lucide-react'
import { Head } from '@inertiajs/react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  returned: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface Shipment {
  id: number
  tracking_number: string
  reference_number?: string
  status: string
  origin_city: string
  destination_city: string
  origin_country: string
  destination_country: string
  item_description: string
  weight: number
  service_type: string
  total_cost: number
}

interface PaginatedResponse {
  data: Shipment[]
  total: number
  current_page: number
  last_page: number
  prev_page_url?: string
  next_page_url?: string
}

interface PageProps {
  shipments: PaginatedResponse
  filters: Record<string, any>
  origins: string[]
  destinations: string[]
}

export default function ShipmentsIndex() {
  const { shipments, filters, origins, destinations } = usePage().props as any

  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [originCity, setOriginCity] = useState(filters.origin_city || '')
  const [destCity, setDestCity] = useState(filters.destination_city || '')
  const [serviceType, setServiceType] = useState(filters.service_type || '')
  const [perPage, setPerPage] = useState(filters.per_page || 50)

  const handleSearch = () => {
    router.get(
      '/shipments',
      {
        search,
        status,
        origin_city: originCity,
        destination_city: destCity,
        service_type: serviceType,
        per_page: perPage,
      },
      { preserveScroll: true }
    )
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setOriginCity('')
    setDestCity('')
    setServiceType('')
    setPerPage(50)
    router.get('/shipments', { per_page: 50 }, { preserveScroll: true })
  }

  const handleExport = () => {
    window.location.href = `/shipments/export/csv?search=${search}&status=${status}`
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shipments</h1>
          <p className="text-gray-600">Manage and track all your shipments</p>
        </div>

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
                    placeholder="Tracking, reference, item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    variant="default"
                  >
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
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Origin City */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From City</label>
                <Select value={originCity} onValueChange={setOriginCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {origins.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination City */}
              <div className="space-y-2">
                <label className="text-sm font-medium">To City</label>
                <Select value={destCity} onValueChange={setDestCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {destinations.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
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
              <Button onClick={handleExport} variant="secondary" className="ml-auto">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <strong>{shipments.data.length}</strong> of{' '}
            <strong>{shipments.total}</strong> shipments
          </p>
          <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shipments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tracking #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {shipments.data.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-semibold">{shipment.tracking_number}</div>
                        {shipment.reference_number && (
                          <div className="text-xs text-gray-500">{shipment.reference_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{shipment.origin_city} → {shipment.destination_city}</div>
                          <div className="text-xs text-gray-500">{shipment.origin_country} → {shipment.destination_country}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{shipment.item_description}</div>
                        <div className="text-xs text-gray-500">
                          {shipment.weight}kg • {shipment.service_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${statusColors[shipment.status]}`}>
                          {shipment.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        ₹{parseFloat(String(shipment.total_cost)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/shipments/${shipment.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {shipments.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {shipments.current_page} of {shipments.last_page}
            </p>
            <div className="flex gap-2">
              {shipments.prev_page_url && (
                <Link href={shipments.prev_page_url} className="px-3 py-2 rounded border hover:bg-gray-100">
                  Previous
                </Link>
              )}
              {shipments.next_page_url && (
                <Link href={shipments.next_page_url} className="px-3 py-2 rounded border hover:bg-gray-100">
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
