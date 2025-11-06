import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Customer {
  id: number
  company_name: string
  email: string
  phone: string
}

interface OrderItem {
  id: number
  sku: string | null
  description: string
  quantity: number
  unit_price: string
  line_total: string
}

interface Order {
  id: number
  order_number: string
  customer: Customer
  order_type: string
  status: string
  order_date: string
  required_delivery_date: string | null
  actual_delivery_date: string | null
  origin_country: string | null
  destination_country: string | null
  total_weight: string | null
  weight_unit: string | null
  subtotal: string
  tax: string
  shipping_cost: string
  total_amount: string
  notes: string | null
  special_instructions: string | null
  items: OrderItem[]
}

interface ShowProps {
  order: Order
}

export default function Show({ order }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Orders',
      href: '/orders',
    },
    {
      title: order.order_number,
      href: `/orders/${order.id}`,
    },
  ]

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this order?')) {
      router.delete(`/orders/${order.id}`)
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
      <Head title={order.order_number} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button size="sm" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground">{order.customer.company_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/orders/${order.id}/edit`}>
              <Button className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Status and Type */}
        <div className="flex gap-2">
          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>{order.status}</Badge>
          <Badge className={typeColors[order.order_type] || 'bg-gray-100 text-gray-800'}>{order.order_type}</Badge>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Order Information */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Order Date</p>
                    <p className="text-sm font-semibold">{new Date(order.order_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Required Delivery</p>
                    <p className="text-sm font-semibold">{order.required_delivery_date ? new Date(order.required_delivery_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual Delivery</p>
                    <p className="text-sm font-semibold">{order.actual_delivery_date ? new Date(order.actual_delivery_date).toLocaleDateString() : 'Not yet delivered'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Origin Country</p>
                    <p className="text-sm font-semibold">{order.origin_country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Destination Country</p>
                    <p className="text-sm font-semibold">{order.destination_country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Weight</p>
                    <p className="text-sm font-semibold">
                      {order.total_weight ? `${order.total_weight} ${order.weight_unit}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-semibold">{order.customer.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-semibold">{order.customer.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Order Items ({order.items?.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b dark:border-gray-700">
                      <tr>
                        <th className="text-left py-2 px-2">SKU</th>
                        <th className="text-left py-2 px-2">Description</th>
                        <th className="text-right py-2 px-2">Qty</th>
                        <th className="text-right py-2 px-2">Unit Price</th>
                        <th className="text-right py-2 px-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id} className="border-b dark:border-gray-700">
                          <td className="py-2 px-2 font-mono text-xs">{item.sku || 'N/A'}</td>
                          <td className="py-2 px-2">{item.description}</td>
                          <td className="text-right py-2 px-2">{item.quantity}</td>
                          <td className="text-right py-2 px-2">${parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="text-right py-2 px-2 font-semibold">${parseFloat(item.line_total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="dark:border-gray-800">
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Special Instructions */}
            {order.special_instructions && (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="dark:border-gray-800">
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.special_instructions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Pricing */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-gray-900 dark:border-gray-800 sticky top-4">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${parseFloat(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span>${parseFloat(order.shipping_cost).toFixed(2)}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
