import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Link, router, usePage } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

export default function ItemEdit() {
  const { item } = usePage().props as any
  const categories = ['Electronics', 'Packaging', 'Shipping', 'General', 'Raw Materials']
  
  const [formData, setFormData] = useState({
    item_code: item.item_code,
    sku: item.sku,
    name: item.name,
    description: item.description || '',
    category: item.category,
    unit_of_measure_id: item.unit_of_measure_id,
    default_cost: item.default_cost,
    default_price: item.default_price,
    weight: item.weight || '',
    length: item.length || '',
    width: item.width || '',
    height: item.height || '',
    hsn_sac: item.hsn_sac || '',
    active_flag: item.active_flag,
  })

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Items', href: '/items' },
    { title: item.name, href: `/items/${item.id}` },
    { title: 'Edit', href: `/items/${item.id}/edit` },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDelete = () => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      router.delete(`/items/${item.id}`, { onFinish: () => router.visit('/items') })
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit - ${item.name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/items">
              <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Item</h1>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        </div>

        <Form method="post" action={`/items/${item.id}`} className="space-y-6">
          <input type="hidden" name="_method" value="PATCH" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Item Code *</label>
                  <Input
                    name="item_code"
                    value={formData.item_code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">SKU *</label>
                  <Input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <Select value={formData.category || 'General'} onValueChange={(val) => handleSelectChange('category', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">HSN/SAC Code</label>
                  <Input
                    name="hsn_sac"
                    value={formData.hsn_sac}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Unit of Measure ID *</label>
                  <Input
                    name="unit_of_measure_id"
                    type="number"
                    value={formData.unit_of_measure_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Default Cost (₹) *</label>
                  <Input
                    name="default_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.default_cost}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Default Price (₹) *</label>
                  <Input
                    name="default_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.default_price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Active</label>
                  <Select value={formData.active_flag ? 'active' : 'inactive'} onValueChange={(val) => handleSelectChange('active_flag', val === 'active')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description & Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Length (cm)</label>
                  <Input type="number" name="length" step="0.01" value={formData.length} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Width (cm)</label>
                  <Input type="number" name="width" step="0.01" value={formData.width} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Height (cm)</label>
                  <Input type="number" name="height" step="0.01" value={formData.height} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Weight (kg)</label>
                  <Input type="number" name="weight" step="0.001" value={formData.weight} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            <Link href={`/items/${item.id}`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </Form>
      </div>
    </AppLayout>
  )
}
