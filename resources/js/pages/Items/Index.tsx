import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link, router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Pencil, Eye } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useAlert } from '@/hooks/use-alert'
import { AlertContainer } from '@/components/alert-container'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'

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
  const { items, filters = {}, categories = [], flash } = usePage().props as any
  const { auth } = usePage().props
  const { alerts, dismissAlert, success, error: showError } = useAlert()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Items', href: '/items' },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [category, setCategory] = useState(filters.category || '')
  const [active, setActive] = useState(filters.active || '')
  const [perPage, setPerPage] = useState(filters.per_page || 15)

  // Show flash messages
  useEffect(() => {
    if (flash?.success) {
      success(flash.success)
    }
    if (flash?.error) {
      showError('Error', flash.error)
    }
  }, [flash])

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

  const handleDelete = (item: Item) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedItem) return
    
    setIsDeleting(true)
    router.delete(`/items/${selectedItem.id}`, {
      onSuccess: () => {
        success(`Item ${selectedItem.item_code} deleted successfully`)
        setIsDeleteOpen(false)
      },
      onError: () => {
        showError('Failed to delete item', 'An error occurred while deleting')
      },
      onFinish: () => {
        setIsDeleting(false)
      },
    })
  }

  const handlePaginate = (page: number) => {
    router.get(`/items?page=${page}`, { search, category, active, per_page: perPage }, { preserveScroll: true })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Items" />
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Select value={category || 'all'} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={active || 'all'} onValueChange={setActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">&nbsp;</label>
                <div className="flex gap-2">
                  <Button onClick={handleSearch} variant="default" className="flex-1">
                    <Search className="w-4 h-4 mr-2" /> Search
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
                </div>
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
                        <Link href={`/items/${item.id}/edit`}>
                          <Button size="sm" variant="ghost"><Pencil className="w-4 h-4" /></Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item)}>
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

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Item"
        description={`Are you sure you want to delete item "${selectedItem?.item_code} - ${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </AppLayout>
  )
}
