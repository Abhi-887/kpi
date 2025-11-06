import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { Link, useForm } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface PackagingPrice {
  id: number
  name: string
  description?: string
  package_type: string
  size_category: string
  length: number
  width: number
  height: number
  max_weight: number
  unit_price: number
  bulk_price_5?: number
  bulk_price_10?: number
  material: string
  is_active: boolean
}

interface Props {
  packagingPrice: PackagingPrice
}

export default function EditPackagingPrice({ packagingPrice }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Packaging Prices', href: '/packaging-prices' },
    { title: 'Edit', href: '#' },
  ]

  const { data, setData, patch, processing, errors } = useForm({
    name: packagingPrice.name,
    description: packagingPrice.description || '',
    package_type: packagingPrice.package_type,
    size_category: packagingPrice.size_category,
    length: String(packagingPrice.length),
    width: String(packagingPrice.width),
    height: String(packagingPrice.height),
    max_weight: String(packagingPrice.max_weight),
    unit_price: String(packagingPrice.unit_price),
    bulk_price_5: String(packagingPrice.bulk_price_5 || ''),
    bulk_price_10: String(packagingPrice.bulk_price_10 || ''),
    material: packagingPrice.material,
    is_active: packagingPrice.is_active,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(`/packaging-prices/${packagingPrice.id}`)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Packaging Price" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-3xl">
          <form onSubmit={submit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Standard Shipping Box"
                    className="mt-1"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={data.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                    placeholder="Additional details"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Active
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Package Info */}
            <Card>
              <CardHeader>
                <CardTitle>Package Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Package Type *</label>
                    <Select value={data.package_type} onValueChange={(value) => setData('package_type', value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="envelope">Envelope</SelectItem>
                        <SelectItem value="tube">Tube</SelectItem>
                        <SelectItem value="crate">Crate</SelectItem>
                        <SelectItem value="pallet">Pallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Size Category *</label>
                    <Select value={data.size_category} onValueChange={(value) => setData('size_category', value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xlarge">X-Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Material *</label>
                  <Input
                    value={data.material}
                    onChange={(e) => setData('material', e.target.value)}
                    placeholder="e.g., Cardboard, Plastic"
                    className="mt-1"
                  />
                  {errors.material && <p className="mt-1 text-sm text-red-600">{errors.material}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Length (cm) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.length}
                      onChange={(e) => setData('length', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.length && <p className="mt-1 text-sm text-red-600">{errors.length}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Width (cm) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.width}
                      onChange={(e) => setData('width', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.width && <p className="mt-1 text-sm text-red-600">{errors.width}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Height (cm) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.height}
                      onChange={(e) => setData('height', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Max Weight (kg) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.max_weight}
                      onChange={(e) => setData('max_weight', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.max_weight && <p className="mt-1 text-sm text-red-600">{errors.max_weight}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Unit Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.unit_price}
                      onChange={(e) => setData('unit_price', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.unit_price && <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bulk Price 5+</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.bulk_price_5}
                      onChange={(e) => setData('bulk_price_5', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bulk Price 10+</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.bulk_price_10}
                      onChange={(e) => setData('bulk_price_10', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/packaging-prices">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
