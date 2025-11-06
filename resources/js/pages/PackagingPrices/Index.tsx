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

const typeColors: Record<string, string> = {
  box: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  envelope: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  tube: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  crate: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  pallet: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
}

interface PackagingPrice {
  id: number
  name: string
  package_type: string
  size_category: string
  unit_price: number
  bulk_price_5?: number
  material: string
  is_active: boolean
}

export default function PackagingPricesIndex() {
  const { packagingPrices, filters } = usePage().props as any
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [packageType, setPackageType] = useState(filters.package_type || '')
  const [perPage, setPerPage] = useState(filters.per_page || 50)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Packaging Prices', href: '/packaging-prices' },
  ]

  const handleSearch = () => {
    router.get(
      '/packaging-prices',
      { search, status, package_type: packageType, per_page: perPage },
      { preserveScroll: true }
    )
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setPackageType('')
    setPerPage(50)
    router.get('/packaging-prices', { per_page: 50 }, { preserveScroll: true })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this packaging price?')) {
      router.delete(`/packaging-prices/${id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Packaging Prices" />
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
                    placeholder="Name, material..."
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
                <label className="text-sm font-medium">Package Type</label>
                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="envelope">Envelope</SelectItem>
                    <SelectItem value="tube">Tube</SelectItem>
                    <SelectItem value="crate">Crate</SelectItem>
                    <SelectItem value="pallet">Pallet</SelectItem>
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
              <Link href="/packaging-prices/create" className="ml-auto">
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Packaging Price
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <strong>{packagingPrices.data.length}</strong> of <strong>{packagingPrices.total}</strong> packaging
            prices
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Material
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
                  {packagingPrices.data.map((price: PackagingPrice) => (
                    <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold">{price.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className={`${typeColors[price.package_type]}`}>{price.package_type}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm">{price.size_category}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold">
                        ₹{parseFloat(String(price.unit_price)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{price.material}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className={`${statusColors[String(price.is_active)]}`}>
                          {price.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/packaging-prices/${price.id}/edit`}
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
        {packagingPrices.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {packagingPrices.current_page} of {packagingPrices.last_page}
            </p>
            <div className="flex gap-2">
              {packagingPrices.prev_page_url && (
                <Link href={packagingPrices.prev_page_url} className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-900/50">
                  Previous
                </Link>
              )}
              {packagingPrices.next_page_url && (
                <Link href={packagingPrices.next_page_url} className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-900/50">
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
