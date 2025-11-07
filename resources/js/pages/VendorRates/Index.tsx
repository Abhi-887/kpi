import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Plus, Search, Edit2, Eye, Trash2 } from 'lucide-react'
import { Head } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
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

interface RateCard {
  id: number
  vendor_name: string
  route: string
  mode: string
  movement: string
  terms: string
  valid_from: string
  valid_upto: string
  is_active: boolean
  line_count: number
  created_at: string
}

interface PaginatedResponse {
  data: RateCard[]
  total: number
  current_page: number
  last_page: number
  per_page: number
  from: number
  to: number
  prev_page_url?: string
  next_page_url?: string
}

interface PageProps {
  rates: PaginatedResponse
  filters: Record<string, any>
}

export default function RateCardsIndex() {
  const props = usePage().props as any
  const rates = props.rates || { data: [], total: 0, current_page: 1, last_page: 1, per_page: 50 }
  const filters = props.filters || {}

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Rate Management',
      href: '/vendor-rates',
    },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [mode, setMode] = useState(filters.mode || '')
  const [movement, setMovement] = useState(filters.movement || '')
  const [status, setStatus] = useState(filters.status || '')
  const [perPage, setPerPage] = useState(filters.per_page || 50)

  const handleSearch = () => {
    router.get(
      '/vendor-rates',
      {
        search,
        mode,
        movement,
        status,
        per_page: perPage,
      },
      { preserveScroll: true }
    )
  }

  const handleReset = () => {
    setSearch('')
    setMode('')
    setMovement('')
    setStatus('')
    setPerPage(50)
    router.get('/vendor-rates', { per_page: 50 }, { preserveScroll: true })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this rate card?')) {
      router.delete(`/vendor-rates/${id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rate Management - Vendor Rate Cards" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rate Management Engine</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage vendor rate cards and pricing by route, mode, and movement</p>
          </div>
          <Link href="/vendor-rates/create">
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Add Rate Card
            </Button>
          </Link>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Vendor</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Vendor name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="sm" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <div className="flex gap-2">
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AIR">Air</SelectItem>
                      <SelectItem value="SEA">Sea</SelectItem>
                      <SelectItem value="ROAD">Road</SelectItem>
                      <SelectItem value="RAIL">Rail</SelectItem>
                      <SelectItem value="MULTIMODAL">Multimodal</SelectItem>
                    </SelectContent>
                  </Select>
                  {mode && <Button size="sm" variant="ghost" onClick={() => setMode('')} className="px-2">✕</Button>}
                </div>
              </div>

              {/* Movement */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Movement</label>
                <div className="flex gap-2">
                  <Select value={movement} onValueChange={setMovement}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Movements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMPORT">Import</SelectItem>
                      <SelectItem value="EXPORT">Export</SelectItem>
                      <SelectItem value="DOMESTIC">Domestic</SelectItem>
                      <SelectItem value="INTER_MODAL">Inter-modal</SelectItem>
                    </SelectContent>
                  </Select>
                  {movement && <Button size="sm" variant="ghost" onClick={() => setMovement('')} className="px-2">✕</Button>}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {status && <Button size="sm" variant="ghost" onClick={() => setStatus('')} className="px-2">✕</Button>}
                </div>
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
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <strong>{rates.data.length}</strong> of <strong>{rates.total}</strong> rate cards
          </p>
        </div>

        {/* Rate Cards Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Movement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Terms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Lines
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rates.data.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No rate cards found. <Link href="/vendor-rates/create" className="text-blue-600 dark:text-blue-400 hover:underline">Create one</Link></p>
                      </td>
                    </tr>
                  ) : (
                    rates.data.map((header: RateCard) => (
                      <tr key={header.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold">{header.vendor_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium">{header.route}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={modeColors[header.mode] || modeColors['AIR']}>
                            {header.mode}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={movementColors[header.movement] || movementColors['EXPORT']}>
                            {header.movement}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">
                          {header.terms}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(header.valid_upto).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold">
                            {header.line_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusColors[header.is_active ? 'active' : 'inactive']}>
                            {header.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Link
                              href={`/vendor-rates/${header.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/vendor-rates/${header.id}/edit`}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 p-1"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(header.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {rates.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {rates.current_page} of {rates.last_page}
            </p>
            <div className="flex gap-2">
              {rates.prev_page_url && (
                <Link href={rates.prev_page_url} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/50 text-sm">
                  Previous
                </Link>
              )}
              {rates.next_page_url && (
                <Link href={rates.next_page_url} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/50 text-sm">
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
