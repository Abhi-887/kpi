import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface Order {
  id: number
  order_number: string
  customer: { company_name: string } | null
  order_type: string
  status: string
  order_date: string
  required_delivery_date: string | null
  total_amount: string
  created_at: string
}

interface IndexProps {
  orders?: {
    data: Order[]
    links: any
    meta: any
  }
  filters?: any
}

export default function Index({ orders = { data: [], links: [], meta: { total: 0, last_page: 1 } }, filters = {} }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Orders',
      href: '/orders',
    },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || 'all')
  const [type, setType] = useState(filters.type || 'all')

  const handleSearch = () => {
    router.get('/orders', {
      search,
      status: status === 'all' ? '' : status,
      type: type === 'all' ? '' : type,
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this order?')) {
      router.delete(`/orders/${id}`)
    }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const typeColors: Record<string, string> = {
    standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    express: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    ltl: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    fcl: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    lcl: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Orders" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">Manage your shipment orders</p>
          </div>
          <Link href="/orders/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Order
            </Button>
          </Link>
        </div>

        {/* Filters Card */}
        <Card className="bg-muted/50 dark:bg-gray-900/50 border-muted dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by order number or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                  <Button onClick={handleSearch} size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="ltl">LTL</SelectItem>
                  <SelectItem value="fcl">FCL</SelectItem>
                  <SelectItem value="lcl">LCL</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="dark:border-gray-800">
            <CardTitle>Orders ({orders?.meta?.total ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Order #</th>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Order Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.data?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders?.data?.map((order) => (
                      <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                        <td className="py-3 px-4">{order.customer?.company_name}</td>
                        <td className="py-3 px-4">
                          <Badge className={typeColors[order.order_type] || 'bg-gray-100 text-gray-800'}>
                            {order.order_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>{order.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/orders/${order.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/orders/${order.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(order.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(orders?.meta?.last_page ?? 1) > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {(orders?.links ?? []).map((link: any, idx: number) => (
                  <Button
                    key={idx}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => link.url && router.get(link.url)}
                    disabled={!link.url}
                  >
                    {link.label.replace('&laquo;', '<<').replace('&raquo;', '>>')}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
