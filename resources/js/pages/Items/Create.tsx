import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

export default function ItemCreate() {
  const categories = ['Electronics', 'Packaging', 'Shipping', 'General', 'Raw Materials']
  const [formData, setFormData] = useState({
    item_code: '',
    sku: '',
    name: '',
    description: '',
    category: 'General',
    unit_of_measure_id: '',
    default_cost: '',
    default_price: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    hsn_sac: '',
    active_flag: true,
  })

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Items', href: '/items' },
    { title: 'Create', href: '/items/create' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Item" />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/items">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </Link>
          <h1 className="text-3xl font-bold">Create New Item</h1>
        </div>

        <Form method="post" action="/items" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Item Code *</label>
                  <Input
                    name="item_code"
                    placeholder="e.g., ITEM-001"
                    value={formData.item_code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">SKU *</label>
                  <Input
                    name="sku"
                    placeholder="e.g., SKU-2025-001"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Name *</label>
                  <Input
                    name="name"
                    placeholder="Item name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
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
                    placeholder="e.g., 4407"
                    value={formData.hsn_sac}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Unit of Measure *</label>
                  <Input
                    name="unit_of_measure_id"
                    placeholder="Enter UoM ID or code"
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
                    placeholder="0.00"
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
                    placeholder="0.00"
                    value={formData.default_price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Active</label>
                  <Select value={formData.active_flag ? '1' : '0'} onValueChange={(val) => handleSelectChange('active_flag', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
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
                  placeholder="Item description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div className="grid md:grid-cols-4 gap-4">
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Item</Button>
            <Link href="/items">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </Form>
      </div>
    </AppLayout>
  )
}
