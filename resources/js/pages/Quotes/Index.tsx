import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Plus, Search, Download, Eye, Trash2 } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface QuoteItem {
  id: number
}

interface Quote {
  id: number
  reference_number: string
  origin_country: string
  destination_country: string
  service_type: string
  total_cost: string
  total_in_currency: string
  currency: string
  status: string
  created_at: string
  created_by?: { name: string }
}

interface IndexProps {
  quotes: {
    data: Quote[]
    links: any
    meta: any
  }
  filters: any
}

export default function Index({ quotes, filters }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Quotes',
      href: '/quotes',
    },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [serviceType, setServiceType] = useState(filters.service_type || '')
  const [perPage, setPerPage] = useState(filters.per_page || 50)

  const handleSearch = () => {
    router.get('/quotes', { search, status, service_type: serviceType, per_page: perPage })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      router.delete(`/quotes/${id}`)
    }
  }

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Quotes" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quotes</h1>
            <p className="text-sm text-muted-foreground">Manage and track shipment quotes</p>
          </div>
          <Link href="/quotes/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Quote
            </Button>
          </Link>
        </div>

        {/* Filters Card */}
        <Card className="bg-muted/50 dark:bg-gray-900/50 border-muted dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-6">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search reference, country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  />
                  <Button variant="outline" size="icon" onClick={handleSearch} className="dark:border-gray-600 dark:hover:bg-gray-800">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={serviceType || 'all'} onValueChange={(value) => setServiceType(value === 'all' ? '' : value)}>
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="overnight">Overnight</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Per Page" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} variant="secondary" className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {quotes.data.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border dark:border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 dark:bg-gray-900/50 dark:border-gray-800">
                  <th className="px-6 py-3 text-left font-semibold">Reference</th>
                  <th className="px-6 py-3 text-left font-semibold">Route</th>
                  <th className="px-6 py-3 text-left font-semibold">Service</th>
                  <th className="px-6 py-3 text-left font-semibold">Total</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Created</th>
                  <th className="px-6 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.data.map((quote, idx) => (
                  <tr key={quote.id} className={idx % 2 === 0 ? 'bg-muted/50 dark:bg-gray-900/30' : 'dark:hover:bg-gray-900/20'}>
                    <td className="px-6 py-3 font-semibold">{quote.reference_number}</td>
                    <td className="px-6 py-3">
                      {quote.origin_country} → {quote.destination_country}
                    </td>
                    <td className="px-6 py-3">
                      <Badge className={serviceTypeColors[quote.service_type]}>{quote.service_type}</Badge>
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      ₹{parseFloat(String(quote.total_cost)).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{new Date(quote.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <Link href={`/quotes/${quote.id}`}>
                          <Button variant="ghost" size="sm" className="dark:hover:bg-gray-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quote.id)}
                          className="text-destructive hover:text-destructive dark:hover:bg-gray-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="bg-muted/50 dark:bg-gray-900/50 border-muted dark:border-gray-800">
            <CardContent className="py-8 text-center text-muted-foreground">
              No quotes found. Create your first quote to get started.
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {quotes.meta?.last_page > 1 && (
          <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="text-sm text-muted-foreground">
              Page {quotes.meta?.current_page} of {quotes.meta?.last_page}
            </div>
            <div className="flex gap-2">
              {quotes.links?.prev && (
                <Link href={quotes.links.prev}>
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {quotes.links?.next && (
                <Link href={quotes.links.next}>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
