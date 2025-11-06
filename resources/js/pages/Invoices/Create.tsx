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
}

interface CreateProps {
  customers: Customer[]
  orders: Order[]
}

export default function Create({ customers, orders }: CreateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Invoices',
      href: '/invoices',
    },
    {
      title: 'Create',
      href: '/invoices/create',
    },
  ]

  const { data, setData, post, processing, errors } = useForm({
    customer_id: '',
    order_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: 'USD',
    po_number: '',
    tax_rate: '',
    discount_amount: '',
    shipping_cost: '',
    notes: '',
    payment_method: '',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/invoices')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Invoice" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <Link href="/invoices">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Invoice</h1>
            <p className="text-sm text-muted-foreground">Create a new invoice</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Invoice Information</CardTitle>
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

                <div>
                  <label className="text-sm font-semibold">Order (Optional)</label>
                  <Select value={data.order_id || 'none'} onValueChange={(v) => setData('order_id', v === 'none' ? '' : v)}>
                    <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          {order.order_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Invoice Date *</label>
                    <Input
                      type="date"
                      value={data.invoice_date}
                      onChange={(e) => setData('invoice_date', e.target.value)}
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.invoice_date && <p className="mt-1 text-sm text-destructive">{errors.invoice_date}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Due Date *</label>
                    <Input
                      type="date"
                      value={data.due_date}
                      onChange={(e) => setData('due_date', e.target.value)}
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.due_date && <p className="mt-1 text-sm text-destructive">{errors.due_date}</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Currency *</label>
                    <Select value={data.currency} onValueChange={(v) => setData('currency', v)}>
                      <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.currency && <p className="mt-1 text-sm text-destructive">{errors.currency}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold">PO Number</label>
                    <Input
                      type="text"
                      value={data.po_number}
                      onChange={(e) => setData('po_number', e.target.value)}
                      placeholder="PO-123456"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-semibold">Tax Rate (%)</label>
                    <Input
                      type="number"
                      value={data.tax_rate}
                      onChange={(e) => setData('tax_rate', e.target.value)}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      max="100"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Discount Amount</label>
                    <Input
                      type="number"
                      value={data.discount_amount}
                      onChange={(e) => setData('discount_amount', e.target.value)}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Shipping Cost</label>
                    <Input
                      type="number"
                      value={data.shipping_cost}
                      onChange={(e) => setData('shipping_cost', e.target.value)}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">Payment Method</label>
                  <Select value={data.payment_method || 'none'} onValueChange={(v) => setData('payment_method', v === 'none' ? '' : v)}>
                    <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="wire">Wire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Additional notes..."
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
                  {processing ? 'Creating...' : 'Create Invoice'}
                </Button>
                <Link href="/invoices">
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
