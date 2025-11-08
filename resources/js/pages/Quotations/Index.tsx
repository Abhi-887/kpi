import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { Link, router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { Plus, Search, Eye, Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type BreadcrumbItem } from '@/types'

interface Quotation {
  id: number
  quote_id: string
  quote_status: string
  customer: { company_name: string }
  mode: string
  movement: string
  total_chargeable_weight: number
  total_cbm: number
  total_pieces: number
  created_by: { name: string }
  created_at: string
}

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

interface IndexProps {
  quotations: {
    data: Quotation[]
    links: PaginationLink[]
    meta?: {
      last_page: number
      current_page: number
    }
    path?: string
    per_page?: number
    total?: number
    last_page?: number
    current_page?: number
  }
  filters: any
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  'Pending Costing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Pending Approval': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Cancelled: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400',
}

const modeColors: Record<string, string> = {
  AIR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SEA: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  ROAD: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  RAIL: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
}

export default function Index({ quotations, filters }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [{ title: 'Quotations', href: '/quotations' }]
  const [search, setSearch] = useState(filters?.search || '')
  const [status, setStatus] = useState(filters?.quote_status || 'all')
  const [mode, setMode] = useState(filters?.mode || 'all')
  const [movement, setMovement] = useState(filters?.movement || 'all')

  const handleFilter = () => {
    router.get('/quotations', {
      search,
      quote_status: status === 'all' ? '' : status,
      mode: mode === 'all' ? '' : mode,
      movement: movement === 'all' ? '' : movement,
      per_page: filters?.per_page || 20,
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleDuplicate = (id: number) => {
    router.post(`/quotations/${id}/duplicate`)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      router.delete(`/quotations/${id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Quotations" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quotations</h1>
            <p className="text-muted-foreground mt-1">Manage and track quotation requests</p>
          </div>
          <Link href="/quotations/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quotation
            </Button>
          </Link>
        </div>

        {/* Filter Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-5">
              <div>
                <label className="text-sm font-medium">Search Quote ID or Customer</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Q-2025-0001..."
                    value={search}
                    onChange={handleSearch}
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                  <Button variant="outline" size="icon" onClick={handleFilter}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending Costing">Pending Costing</SelectItem>
                    <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Mode</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="AIR">Air</SelectItem>
                    <SelectItem value="SEA">Sea</SelectItem>
                    <SelectItem value="ROAD">Road</SelectItem>
                    <SelectItem value="RAIL">Rail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Movement</label>
                <Select value={movement} onValueChange={setMovement}>
                  <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="All movements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Movements</SelectItem>
                    <SelectItem value="IMPORT">Import</SelectItem>
                    <SelectItem value="EXPORT">Export</SelectItem>
                    <SelectItem value="DOMESTIC">Domestic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">&nbsp;</label>
                <Button onClick={handleFilter} className="w-full mt-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card>
          <CardContent className="p-0">
            {quotations.data.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No quotations found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-3 text-left font-semibold">Quote ID</th>
                      <th className="px-6 py-3 text-left font-semibold">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold">Mode</th>
                      <th className="px-6 py-3 text-center font-semibold">Totals</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                      <th className="px-6 py-3 text-left font-semibold">Created</th>
                      <th className="px-6 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.data.map((quotation, idx) => (
                      <tr
                        key={quotation.id}
                        className={idx % 2 === 0 ? 'bg-muted/50 dark:bg-gray-900/30' : 'dark:hover:bg-gray-900/20'}
                      >
                        <td className="px-6 py-3 font-mono font-semibold">
                          <Link href={`/quotations/${quotation.id}`} className="hover:underline">
                            {quotation.quote_id}
                          </Link>
                        </td>
                        <td className="px-6 py-3">{quotation.customer.company_name}</td>
                        <td className="px-6 py-3">
                          <Badge className={modeColors[quotation.mode]}>{quotation.mode}</Badge>
                        </td>
                        <td className="px-6 py-3 text-center text-sm">
                          <p className="font-mono text-xs">
                            {quotation.total_chargeable_weight.toFixed(2)} kg • {quotation.total_cbm.toFixed(4)} CBM
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <Badge className={statusColors[quotation.quote_status] || statusColors.Draft}>
                            {quotation.quote_status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {new Date(quotation.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Link href={`/quotations/${quotation.id}`}>
                              <Button size="sm" variant="ghost" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {quotation.quote_status === 'Draft' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDuplicate(quotation.id)}
                                  title="Duplicate"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(quotation.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {(quotations.meta?.last_page ?? quotations.last_page ?? 1) > 1 && (
          <div className="flex justify-center gap-2">
            {quotations.links?.map((link, idx) => (
              <Button
                key={idx}
                variant={link.active ? 'default' : 'outline'}
                disabled={!link.url}
                onClick={() => {
                  if (link.url) {
                    router.visit(link.url)
                  }
                }}
                className="text-xs"
              >
                {link.label.replace(/&laquo;|&raquo;/g, (match) => (match === '&laquo;' ? '←' : '→'))}
              </Button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
