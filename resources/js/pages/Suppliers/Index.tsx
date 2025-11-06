import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Link, router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Supplier {
  id: number
  supplier_id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  rating_score?: number
  is_active: boolean
}

interface PaginatedResponse {
  data: Supplier[]
  total: number
  current_page: number
  last_page: number
  path: string
  per_page: number
}

export default function SuppliersIndex() {
  const { suppliers = { data: [], total: 0, current_page: 1, last_page: 1, per_page: 15 }, filters = {} } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Suppliers', href: '/suppliers' },
  ]

  const [search, setSearch] = useState(filters.search || '')

  const handleSearch = () => {
    router.get('/suppliers', { search }, { preserveScroll: true })
  }

  const handleReset = () => {
    setSearch('')
    router.get('/suppliers', {}, { preserveScroll: true })
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this supplier?')) {
      router.delete(`/suppliers/${id}`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Suppliers" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <Link href="/suppliers/create">
            <Button><Plus className="w-4 h-4 mr-2" /> Add Supplier</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={handleSearch}><Search className="w-4 h-4 mr-2" />Search</Button>
              <Button onClick={handleReset} variant="outline">Reset</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers ({suppliers?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-center py-3 px-4 font-medium">Rating</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers?.data?.map((supplier: Supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">{supplier.supplier_id}</td>
                      <td className="py-3 px-4 font-semibold">{supplier.name}</td>
                      <td className="py-3 px-4 text-sm">{supplier.contact_person || '-'}</td>
                      <td className="py-3 px-4 text-sm">{supplier.email || '-'}</td>
                      <td className="py-3 px-4 text-center">★{supplier.rating_score || 'N/A'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={supplier.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30'}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Link href={`/suppliers/${supplier.id}/edit`}>
                          <Button size="sm" variant="ghost"><Pencil className="w-4 h-4" /></Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(supplier.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {suppliers?.data?.length === 0 && <div className="text-center py-8 text-muted-foreground">No suppliers found</div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
