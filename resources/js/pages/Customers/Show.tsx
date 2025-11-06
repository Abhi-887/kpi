import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Edit2, Trash2, MapPin } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { router } from '@inertiajs/react'

interface Address {
  id: number
  street_address: string
  city: string
  state_province: string
  postal_code: string
  country: string
  address_type: string
  is_primary: boolean
}

interface PaymentTerm {
  name: string
  days_to_pay: number
  discount_percentage: string
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
  credit_limit: string
  used_credit: string
  status: string
  total_orders: number
  last_order_date: string | null
  payment_term: PaymentTerm | null
  addresses: Address[]
  created_at: string
}

interface ShowProps {
  customer: Customer
}

export default function Show({ customer }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Customers',
      href: '/customers',
    },
    {
      title: customer.company_name,
      href: `/customers/${customer.id}`,
    },
  ]

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this customer?')) {
      router.delete(`/customers/${customer.id}`)
    }
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const typeColors: Record<string, string> = {
    individual: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    business: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    corporate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  }

  const addressTypeColors: Record<string, string> = {
    billing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipping: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    both: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  }

  const availableCredit = parseFloat(customer.credit_limit) - parseFloat(customer.used_credit)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={customer.company_name} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <Button size="sm" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{customer.company_name}</h1>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/customers/${customer.id}/edit`}>
              <Button className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Status & Type Badges */}
        <div className="flex gap-2">
          <Badge className={statusColors[customer.status]}>
            {customer.status}
          </Badge>
          <Badge className={typeColors[customer.customer_type]}>
            {customer.customer_type}
          </Badge>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Information */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
                {customer.secondary_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Secondary Phone</p>
                    <p className="font-medium">{customer.secondary_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {customer.registration_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="font-medium">{customer.registration_number}</p>
                  </div>
                )}
                {customer.tax_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tax ID</p>
                    <p className="font-medium">{customer.tax_id}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            {customer.addresses.length > 0 && (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="dark:border-gray-800">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Addresses ({customer.addresses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.addresses.map((address) => (
                    <div key={address.id} className="border-l-2 border-blue-500 pl-4 dark:border-blue-400">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-2">
                          <Badge className={addressTypeColors[address.address_type]}>
                            {address.address_type}
                          </Badge>
                          {address.is_primary && (
                            <Badge variant="default">Primary</Badge>
                          )}
                        </div>
                      </div>
                      <p className="font-medium">{address.street_address}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state_province} {address.postal_code}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.country}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Credit Information */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle className="text-base">Credit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Credit Limit</p>
                  <p className="text-2xl font-bold">${parseFloat(customer.credit_limit).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Used Credit</p>
                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    ${parseFloat(customer.used_credit).toFixed(2)}
                  </p>
                </div>
                <div className="pt-2 border-t dark:border-gray-700">
                  <p className="text-sm text-muted-foreground">Available Credit</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ${availableCredit.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            {customer.payment_term && (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="dark:border-gray-800">
                  <CardTitle className="text-base">Payment Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{customer.payment_term.name}</p>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Days to Pay: <span className="font-medium">{customer.payment_term.days_to_pay}</span>
                    </p>
                    {parseFloat(customer.payment_term.discount_percentage) > 0 && (
                      <p className="text-muted-foreground">
                        Early Payment Discount: <span className="font-medium">{customer.payment_term.discount_percentage}%</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Statistics */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle className="text-base">Order Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{customer.total_orders}</p>
                </div>
                {customer.last_order_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Order</p>
                    <p className="font-medium">
                      {new Date(customer.last_order_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
