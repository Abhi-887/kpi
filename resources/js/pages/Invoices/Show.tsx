import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ArrowLeft, Download, Mail } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { router } from '@inertiajs/react'

interface Customer {
  id: number
  company_name: string
}

interface Order {
  id: number
  order_number: string
}

interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  tax_amount: number
  line_total: number
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
  paid_date: string | null
  subtotal: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  amount_paid: number
  po_number: string | null
  notes: string | null
  status_color: string
  items: InvoiceItem[]
}

interface ShowProps {
  invoice: Invoice
}

export default function Show({ invoice }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Invoices',
      href: '/invoices',
    },
    {
      title: invoice.invoice_number,
      href: `/invoices/${invoice.id}`,
    },
  ]

  const remaining = parseFloat(invoice.total_amount as any) - parseFloat(invoice.amount_paid as any)

  const getPaymentStatus = () => {
    const paid = parseFloat(invoice.amount_paid as any)
    const total = parseFloat(invoice.total_amount as any)

    if (paid >= total) return { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    if (paid > 0) return { label: 'Partially Paid', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
    return { label: 'Unpaid', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={invoice.invoice_number} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/invoices">
              <Button size="sm" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
              <p className="text-sm text-muted-foreground">Invoice Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Send
            </Button>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button>Edit</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Invoice Info */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="font-semibold">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={invoice.status_color}>{invoice.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{invoice.customer.company_name}</p>
                </div>
                {invoice.po_number && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">PO Number</p>
                    <p className="font-semibold">{invoice.po_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b dark:border-gray-800">
                      <tr className="bg-muted dark:bg-gray-800/50">
                        <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold">Quantity</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold">Unit Price</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold">Tax Rate</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                      {invoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 text-sm">{item.description}</td>
                          <td className="px-6 py-4 text-right text-sm">{item.quantity}</td>
                          <td className="px-6 py-4 text-right text-sm">
                            {parseFloat(item.unit_price as any).toLocaleString('en-US', {
                              style: 'currency',
                              currency: invoice.currency,
                            })}
                          </td>
                          <td className="px-6 py-4 text-right text-sm">{item.tax_rate}%</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold">
                            {parseFloat(item.line_total as any).toLocaleString('en-US', {
                              style: 'currency',
                              currency: invoice.currency,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Totals */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle className="text-base">Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    {parseFloat(invoice.subtotal as any).toLocaleString('en-US', {
                      style: 'currency',
                      currency: invoice.currency,
                    })}
                  </span>
                </div>
                {parseFloat(invoice.discount_amount as any) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-semibold">
                      -
                      {parseFloat(invoice.discount_amount as any).toLocaleString('en-US', {
                        style: 'currency',
                        currency: invoice.currency,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                  <span className="font-semibold">
                    {parseFloat(invoice.tax_amount as any).toLocaleString('en-US', {
                      style: 'currency',
                      currency: invoice.currency,
                    })}
                  </span>
                </div>
                {parseFloat(invoice.shipping_cost as any) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">
                      {parseFloat(invoice.shipping_cost as any).toLocaleString('en-US', {
                        style: 'currency',
                        currency: invoice.currency,
                      })}
                    </span>
                  </div>
                )}
                <div className="border-t dark:border-gray-800 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Due</span>
                    <span className="text-lg font-bold">
                      {parseFloat(invoice.total_amount as any).toLocaleString('en-US', {
                        style: 'currency',
                        currency: invoice.currency,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle className="text-base">Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getPaymentStatus().color}>{getPaymentStatus().label}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="font-semibold text-green-600">
                    {parseFloat(invoice.amount_paid as any).toLocaleString('en-US', {
                      style: 'currency',
                      currency: invoice.currency,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {remaining.toLocaleString('en-US', {
                      style: 'currency',
                      currency: invoice.currency,
                    })}
                  </p>
                </div>
                {remaining > 0 && (
                  <Button className="w-full mt-2">Record Payment</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
