import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { Link, router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { Eye, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type BreadcrumbItem } from '@/types'

const statusColors: Record<string, string> = {
  favorable: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  unfavorable: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
}

interface Comparison {
  id: number
  login_id: string
  our_price: number
  competitor_price: number
  price_difference: number
  status: string
  rate_card?: { name: string }
  user?: { name: string }
}

export default function PriceComparisonsIndex() {
  const { comparisons, filters } = usePage().props as any
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [perPage, setPerPage] = useState(filters.per_page || 50)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Price Comparisons', href: '/price-comparisons' },
  ]

  const handleSearch = () => {
    router.get(
      '/price-comparisons',
      { search, status, per_page: perPage },
      { preserveScroll: true }
    )
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setPerPage(50)
    router.get('/price-comparisons', { per_page: 50 }, { preserveScroll: true })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this price comparison?')) {
      router.delete(`/price-comparisons/${id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Price Comparisons" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Login ID..."
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
                    <SelectItem value="favorable">Favorable</SelectItem>
                    <SelectItem value="unfavorable">Unfavorable</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
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
              <Link href="/price-comparisons/create" className="ml-auto">
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Comparison
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <strong>{comparisons.data.length}</strong> of <strong>{comparisons.total}</strong> price comparisons
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
                      Login ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Our Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Competitor Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Difference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Rate Card
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comparisons.data.map((comp: Comparison) => (
                    <tr key={comp.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold">{comp.login_id}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold">
                        ₹{parseFloat(String(comp.our_price)).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold">
                        ₹{parseFloat(String(comp.competitor_price)).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          (comp.price_difference as any) < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          ₹{parseFloat(String(comp.price_difference)).toFixed(2)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className={`${statusColors[comp.status]}`}>{comp.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{comp.rate_card?.name || 'N/A'}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/price-comparisons/${comp.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/price-comparisons/${comp.id}/edit`}
                            className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(comp.id)}
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
        {comparisons.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {comparisons.current_page} of {comparisons.last_page}
            </p>
            <div className="flex gap-2">
              {comparisons.prev_page_url && (
                <Link href={comparisons.prev_page_url} className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-900/50">
                  Previous
                </Link>
              )}
              {comparisons.next_page_url && (
                <Link href={comparisons.next_page_url} className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-900/50">
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
