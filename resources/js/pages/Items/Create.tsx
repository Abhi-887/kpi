import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { useState, useEffect } from 'react'
import { useAlert } from '@/hooks/use-alert'
import { AlertContainer } from '@/components/alert-container'

interface UnitOfMeasure {
  id: number
  name: string
  symbol: string
}

interface PageProps {
  unitOfMeasures: UnitOfMeasure[]
  errors?: Record<string, string>
  flash?: {
    success?: string
    error?: string
  }
}

export default function ItemCreate() {
  const { unitOfMeasures = [], errors: serverErrors = {}, flash } = usePage<PageProps>().props as any
  const { alerts, dismissAlert, success, error: showError } = useAlert()
  const categories = ['Electronics', 'Packaging', 'Shipping', 'General', 'Raw Materials']
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
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

  // Show server-side errors
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors(serverErrors)
    }
  }, [serverErrors])

  // Show flash messages
  useEffect(() => {
    if (flash?.success) {
      success(flash.success)
    }
    if (flash?.error) {
      showError('Error', flash.error)
    }
  }, [flash])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.item_code.trim()) {
      newErrors.item_code = 'Item code is required'
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.unit_of_measure_id) {
      newErrors.unit_of_measure_id = 'Unit of Measure is required'
    }
    if (!formData.default_cost || parseFloat(formData.default_cost) < 0) {
      newErrors.default_cost = 'Valid cost is required'
    }
    if (!formData.default_price || parseFloat(formData.default_price) < 0) {
      newErrors.default_price = 'Valid price is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showError('Validation Error', 'Please fix the errors before submitting')
      return
    }

    setIsSubmitting(true)

    const payload = {
      ...formData,
      unit_of_measure_id: parseInt(formData.unit_of_measure_id),
      default_cost: parseFloat(formData.default_cost),
      default_price: parseFloat(formData.default_price),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      height: formData.height ? parseFloat(formData.height) : null,
    }

    router.post('/items', payload, {
      onSuccess: () => {
        success('Item created successfully!')
      },
      onError: (errors) => {
        setErrors(errors as Record<string, string>)
        showError('Failed to create item', 'Please check the form for errors')
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Item" />
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Link href="/items">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </Link>
          <h1 className="text-3xl font-bold">Create New Item</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="item_code">Item Code *</Label>
                  <Input
                    id="item_code"
                    name="item_code"
                    placeholder="e.g., ITEM-001"
                    value={formData.item_code}
                    onChange={handleChange}
                    className={errors.item_code ? 'border-red-500' : ''}
                  />
                  {errors.item_code && <p className="text-red-500 text-sm mt-1">{errors.item_code}</p>}
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="e.g., SKU-2025-001"
                    value={formData.sku}
                    onChange={handleChange}
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                </div>
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Item name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category || 'General'} onValueChange={(val) => handleSelectChange('category', val)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div>
                  <Label htmlFor="hsn_sac">HSN/SAC Code</Label>
                  <Input
                    id="hsn_sac"
                    name="hsn_sac"
                    placeholder="e.g., 4407"
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
                  <Label htmlFor="unit_of_measure_id">Unit of Measure *</Label>
                  <Select 
                    value={formData.unit_of_measure_id} 
                    onValueChange={(val) => handleSelectChange('unit_of_measure_id', val)}
                  >
                    <SelectTrigger className={errors.unit_of_measure_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Unit of Measure" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOfMeasures?.map((uom: UnitOfMeasure) => (
                        <SelectItem key={uom.id} value={String(uom.id)}>
                          {uom.name} ({uom.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit_of_measure_id && <p className="text-red-500 text-sm mt-1">{errors.unit_of_measure_id}</p>}
                </div>
                <div>
                  <Label htmlFor="default_cost">Default Cost (₹) *</Label>
                  <Input
                    id="default_cost"
                    name="default_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.default_cost}
                    onChange={handleChange}
                    className={errors.default_cost ? 'border-red-500' : ''}
                  />
                  {errors.default_cost && <p className="text-red-500 text-sm mt-1">{errors.default_cost}</p>}
                </div>
                <div>
                  <Label htmlFor="default_price">Default Price (₹) *</Label>
                  <Input
                    id="default_price"
                    name="default_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.default_price}
                    onChange={handleChange}
                    className={errors.default_price ? 'border-red-500' : ''}
                  />
                  {errors.default_price && <p className="text-red-500 text-sm mt-1">{errors.default_price}</p>}
                </div>
                <div>
                  <Label htmlFor="active_flag">Status</Label>
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
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Item description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input id="length" type="number" name="length" step="0.01" value={formData.length} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input id="width" type="number" name="width" step="0.01" value={formData.width} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" name="height" step="0.01" value={formData.height} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" name="weight" step="0.001" value={formData.weight} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Item'}
            </Button>
            <Link href="/items">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
