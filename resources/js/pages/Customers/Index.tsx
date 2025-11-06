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

interface Customer {
  id: number
  company_name: string
  customer_type: string
  email: string
  phone: string
  credit_limit: string
  used_credit: string
  status: string
  payment_term: { name: string } | null
  created_at: string
}

interface IndexProps {
  customers?: {
    data: Customer[]
    links: any
    meta: any
  }
  filters?: any
}

export default function Index({ customers = { data: [], links: [], meta: { total: 0, last_page: 1 } }, filters = {} }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Customers',
      href: '/customers',
    },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [type, setType] = useState(filters.type || '')

  const handleSearch = () => {
    router.get('/customers', { 
      search, 
      status: status === 'all' ? '' : status, 
      type: type === 'all' ? '' : type 
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      router.delete(`/customers/${id}`)
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Customers" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage your customer database</p>
          </div>
          <Link href="/customers/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
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
                    placeholder="Search by name, email or phone..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="dark:border-gray-800">
            <CardTitle>Customers ({customers?.meta?.total ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Company Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Payment Term</th>
                    <th className="text-left py-3 px-4 font-semibold">Credit Limit</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.data.map((customer) => (
                      <tr key={customer.id} className="border-b dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-medium">{customer.company_name}</td>
                        <td className="py-3 px-4 text-sm">{customer.email}</td>
                        <td className="py-3 px-4">
                          <Badge className={typeColors[customer.customer_type]}>
                            {customer.customer_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{customer.payment_term?.name || '-'}</td>
                        <td className="py-3 px-4 text-sm">${parseFloat(customer.credit_limit).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[customer.status]}>
                            {customer.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/customers/${customer.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(customer.id)}
                            >
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
            {(customers?.meta?.last_page ?? 1) > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {(customers?.links ?? []).map((link: any, idx: number) => (
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
