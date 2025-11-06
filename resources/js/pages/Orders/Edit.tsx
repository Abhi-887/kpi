import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Customer {
  id: number
  company_name: string
}

interface Order {
  id: number
  order_number: string
  customer_id: number
  order_type: string
  status: string
  order_date: string
  required_delivery_date: string | null
  actual_delivery_date: string | null
  origin_country: string | null
  destination_country: string | null
  total_weight: string | null
  weight_unit: string
  notes: string | null
  special_instructions: string | null
}

interface EditProps {
  order: Order
  customers: Customer[]
}

export default function Edit({ order, customers }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Orders',
      href: '/orders',
    },
    {
      title: order.order_number,
      href: `/orders/${order.id}`,
    },
    {
      title: 'Edit',
      href: `/orders/${order.id}/edit`,
    },
  ]

  const { data, setData, patch, processing, errors } = useForm({
    customer_id: order.customer_id.toString(),
    order_type: order.order_type,
    status: order.status,
    order_date: order.order_date.split('T')[0],
    required_delivery_date: order.required_delivery_date?.split('T')[0] || '',
    actual_delivery_date: order.actual_delivery_date?.split('T')[0] || '',
    origin_country: order.origin_country || '',
    destination_country: order.destination_country || '',
    total_weight: order.total_weight || '',
    weight_unit: order.weight_unit,
    notes: order.notes || '',
    special_instructions: order.special_instructions || '',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(`/orders/${order.id}`)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${order.order_number}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <Link href={`/orders/${order.id}`}>
            <Button size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Order</h1>
            <p className="text-sm text-muted-foreground">{order.order_number}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">Customer *</label>
                  <Select value={data.customer_id} onValueChange={(v) => setData('customer_id', v)}>
                    <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customer_id && <p className="mt-1 text-sm text-destructive">{errors.customer_id}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Order Type *</label>
                    <Select value={data.order_type} onValueChange={(v) => setData('order_type', v)}>
                      <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="ltl">LTL</SelectItem>
                        <SelectItem value="fcl">FCL</SelectItem>
                        <SelectItem value="lcl">LCL</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.order_type && <p className="mt-1 text-sm text-destructive">{errors.order_type}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Status *</label>
                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                      <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="mt-1 text-sm text-destructive">{errors.status}</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Order Date *</label>
                    <Input
                      type="date"
                      value={data.order_date}
                      onChange={(e) => setData('order_date', e.target.value)}
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.order_date && <p className="mt-1 text-sm text-destructive">{errors.order_date}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Required Delivery Date</label>
                    <Input
                      type="date"
                      value={data.required_delivery_date}
                      onChange={(e) => setData('required_delivery_date', e.target.value)}
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.required_delivery_date && (
                      <p className="mt-1 text-sm text-destructive">{errors.required_delivery_date}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Actual Delivery Date</label>
                    <Input
                      type="date"
                      value={data.actual_delivery_date}
                      onChange={(e) => setData('actual_delivery_date', e.target.value)}
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Weight Unit</label>
                    <Select value={data.weight_unit} onValueChange={(v) => setData('weight_unit', v)}>
                      <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        <SelectItem value="tons">Metric Tons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-semibold">Origin Country</label>
                    <Input
                      type="text"
                      value={data.origin_country}
                      onChange={(e) => setData('origin_country', e.target.value)}
                      placeholder="US"
                      maxLength={2}
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Destination Country</label>
                    <Input
                      type="text"
                      value={data.destination_country}
                      onChange={(e) => setData('destination_country', e.target.value)}
                      placeholder="CA"
                      maxLength={2}
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Total Weight</label>
                    <Input
                      type="number"
                      value={data.total_weight}
                      onChange={(e) => setData('total_weight', e.target.value)}
                      placeholder="100"
                      step="0.01"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Additional notes about the order..."
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Special Instructions</label>
                  <textarea
                    value={data.special_instructions}
                    onChange={(e) => setData('special_instructions', e.target.value)}
                    placeholder="Any special handling instructions..."
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" disabled={processing} className="w-full">
                  {processing ? 'Updating...' : 'Update Order'}
                </Button>
                <Link href={`/orders/${order.id}`}>
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
