import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { FileText, MoreHorizontal, Plus, Search } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { Badge } from '@/components/ui/badge'
import { useCallback, useMemo } from 'react'

interface Customer {
  id: number
  company_name: string
}

interface Order {
  id: number
  order_number: string
}

interface Invoice {
  id: number
  invoice_number: string
  customer_id: number
  customer: Customer
  order_id: number | null
  order: Order | null
  status: string
  currency: string
  invoice_date: string
  due_date: string
  total_amount: number
  amount_paid: number
  status_color: string
}

interface PaginatedInvoices {
  data: Invoice[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface IndexProps {
  invoices: PaginatedInvoices
  filters: {
    search: string | null
    status: string | null
    payment_status: string | null
    date_from: string | null
    date_to: string | null
  }
}

export default function Index({ invoices, filters }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Invoices',
      href: '/invoices',
    },
  ]

  const handleSearch = useCallback(
    (value: string) => {
      router.get('/invoices', { ...filters, search: value || undefined }, { preserveScroll: true })
    },
    [filters]
  )

  const handleStatusFilter = useCallback(
    (status: string) => {
      router.get('/invoices', { ...filters, status: status || undefined }, { preserveScroll: true })
    },
    [filters]
  )

  const handlePaymentStatusFilter = useCallback(
    (paymentStatus: string) => {
      router.get(
        '/invoices',
        { ...filters, payment_status: paymentStatus || undefined },
        { preserveScroll: true }
      )
    },
    [filters]
  )

  const getPaymentStatus = (invoice: Invoice) => {
    const paid = parseFloat(invoice.amount_paid as any)
    const total = parseFloat(invoice.total_amount as any)

    if (paid >= total) return { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    if (paid > 0) return { label: 'Partially Paid', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
    return { label: 'Unpaid', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  }

  const stats = useMemo(() => {
    const total = invoices.data.reduce((sum, inv) => sum + parseFloat(inv.total_amount as any), 0)
    const paid = invoices.data.reduce((sum, inv) => sum + parseFloat(inv.amount_paid as any), 0)
    const pending = total - paid

    return {
      total: total.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      paid: paid.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      pending: pending.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    }
  }, [invoices.data])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Invoices" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-sm text-muted-foreground">Manage and track your invoices</p>
          </div>
          <Link href="/invoices/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="mt-2 text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Paid</div>
              <div className="mt-2 text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="mt-2 text-2xl font-bold text-red-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="border-b dark:border-gray-800">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-semibold">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Invoice number, customer..."
                    defaultValue={filters.search || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Status</label>
                <Select defaultValue={filters.status || 'all'} onValueChange={(v) => handleStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold">Payment Status</label>
                <Select defaultValue={filters.payment_status || 'all'} onValueChange={(v) => handlePaymentStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="border-b dark:border-gray-800">
            <CardTitle className="text-base">
              Invoices ({invoices.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b dark:border-gray-800">
                  <tr className="bg-muted dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Invoice Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Paid</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-800">
                  {invoices.data.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-muted/50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => router.visit(`/invoices/${invoice.id}`)}
                    >
                      <td className="px-6 py-4">
                        <Link href={`/invoices/${invoice.id}`} className="font-semibold hover:underline">
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">{invoice.customer.company_name}</td>
                      <td className="px-6 py-4 text-sm">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold">
                        {parseFloat(invoice.total_amount as any).toLocaleString('en-US', {
                          style: 'currency',
                          currency: invoice.currency,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                        {parseFloat(invoice.amount_paid as any).toLocaleString('en-US', {
                          style: 'currency',
                          currency: invoice.currency,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={invoice.status_color}>{invoice.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getPaymentStatus(invoice).color}>{getPaymentStatus(invoice).label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {invoices.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {invoices.from} to {invoices.to} of {invoices.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={invoices.current_page === 1}
                onClick={() =>
                  router.get('/invoices', { ...filters, page: invoices.current_page - 1 }, { preserveScroll: true })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={invoices.current_page === invoices.last_page}
                onClick={() =>
                  router.get('/invoices', { ...filters, page: invoices.current_page + 1 }, { preserveScroll: true })
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
