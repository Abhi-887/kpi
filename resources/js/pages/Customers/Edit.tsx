import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface PaymentTerm {
  id: number
  name: string
}

interface Customer {
  id: number
  company_name: string
  customer_type: string
  email: string
  phone: string
  secondary_phone: string | null
  registration_number: string | null
  tax_id: string | null
  payment_term_id: number | null
  credit_limit: string
  status: string
}

interface EditProps {
  customer: Customer
  paymentTerms: PaymentTerm[]
}

export default function Edit({ customer, paymentTerms }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Customers',
      href: '/customers',
    },
    {
      title: customer.company_name,
      href: `/customers/${customer.id}`,
    },
    {
      title: 'Edit',
      href: `/customers/${customer.id}/edit`,
    },
  ]

  const { data, setData, put, processing, errors } = useForm({
    company_name: customer.company_name,
    customer_type: customer.customer_type,
    email: customer.email,
    phone: customer.phone,
    secondary_phone: customer.secondary_phone || '',
    registration_number: customer.registration_number || '',
    tax_id: customer.tax_id || '',
    payment_term_id: customer.payment_term_id?.toString() || '',
    credit_limit: customer.credit_limit,
    status: customer.status,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/customers/${customer.id}`)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${customer.company_name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <Link href={`/customers/${customer.id}`}>
            <Button size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Customer</h1>
            <p className="text-sm text-muted-foreground">{customer.company_name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">Company Name *</label>
                  <Input
                    type="text"
                    value={data.company_name}
                    onChange={(e) => setData('company_name', e.target.value)}
                    placeholder="ABC Logistics Ltd."
                    className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                  />
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-destructive">{errors.company_name}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Type *</label>
                    <Select value={data.customer_type} onValueChange={(v) => setData('customer_type', v)}>
                      <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.customer_type && (
                      <p className="mt-1 text-sm text-destructive">{errors.customer_type}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Email *</label>
                    <Input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="contact@company.com"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Phone *</label>
                    <Input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Secondary Phone</label>
                    <Input
                      type="tel"
                      value={data.secondary_phone}
                      onChange={(e) => setData('secondary_phone', e.target.value)}
                      placeholder="+1 (555) 000-0001"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Registration Number</label>
                    <Input
                      type="text"
                      value={data.registration_number}
                      onChange={(e) => setData('registration_number', e.target.value)}
                      placeholder="REG-12345"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Tax ID</label>
                    <Input
                      type="text"
                      value={data.tax_id}
                      onChange={(e) => setData('tax_id', e.target.value)}
                      placeholder="TAX-12345"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment & Credit Info */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">Payment Term</label>
                    <Select value={data.payment_term_id} onValueChange={(v) => setData('payment_term_id', v)}>
                      <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue placeholder="Select payment term..." />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTerms.map((term) => (
                          <SelectItem key={term.id} value={term.id.toString()}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.payment_term_id && (
                      <p className="mt-1 text-sm text-destructive">{errors.payment_term_id}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Credit Limit *</label>
                    <Input
                      type="number"
                      value={data.credit_limit}
                      onChange={(e) => setData('credit_limit', e.target.value)}
                      placeholder="10000.00"
                      step="0.01"
                      className="mt-1 dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.credit_limit && (
                      <p className="mt-1 text-sm text-destructive">{errors.credit_limit}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">Status *</label>
                  <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-destructive">{errors.status}</p>
                  )}
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
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/customers/${customer.id}`}>
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
