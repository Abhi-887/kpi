import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link, router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Item {
  id: number
  item_code: string
  sku: string
  name: string
  category: string
  default_cost: number
  default_price: number
  active_flag: boolean
  unit_of_measure?: { id: number; name: string; symbol: string }
}

interface PaginatedResponse {
  data: Item[]
  total: number
  current_page: number
  last_page: number
  path: string
  per_page: number
}

interface PageProps {
  items: PaginatedResponse
  filters?: Record<string, any>
  categories?: string[]
}

export default function ItemsIndex() {
  const { items, filters = {}, categories = [] } = usePage().props as any
  const { auth } = usePage().props

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Items', href: '/items' },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [category, setCategory] = useState(filters.category || '')
  const [active, setActive] = useState(filters.active || '')
  const [perPage, setPerPage] = useState(filters.per_page || 15)

  const handleSearch = () => {
    router.get('/items', { search, category, active, per_page: perPage }, { preserveScroll: true })
  }

  const handleReset = () => {
    setSearch('')
    setCategory('')
    setActive('')
    setPerPage(15)
    router.get('/items', {}, { preserveScroll: true })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      router.delete(`/items/${id}`)
    }
  }

  const handlePaginate = (page: number) => {
    router.get(`/items?page=${page}`, { search, category, active, per_page: perPage }, { preserveScroll: true })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Items" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Items</h1>
          <Link href="/items/create">
            <Button><Plus className="w-4 h-4 mr-2" /> Create Item</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <Input
                  placeholder="Item Code, SKU, or Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={active} onValueChange={setActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} variant="default" className="flex-1">
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items ({items?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Item Code</th>
                    <th className="text-left py-3 px-4 font-medium">SKU</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Cost</th>
                    <th className="text-right py-3 px-4 font-medium">Price</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.data?.map((item: Item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">{item.item_code}</td>
                      <td className="py-3 px-4 font-mono text-xs">{item.sku}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4"><Badge variant="outline">{item.category}</Badge></td>
                      <td className="py-3 px-4 text-right">₹{Number(item.default_cost).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">₹{Number(item.default_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={item.active_flag ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30'}>
                          {item.active_flag ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Link href={`/items/${item.id}`}>
                          <Button size="sm" variant="ghost"><Pencil className="w-4 h-4" /></Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No items found</div>
            )}

            {items && items.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: items.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePaginate(page)}
                    variant={page === items.current_page ? 'default' : 'outline'}
                  >
                    {page}
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
