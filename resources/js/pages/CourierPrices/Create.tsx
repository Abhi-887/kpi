import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { Link, useForm } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

export default function CreateCourierPrice() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Courier Prices', href: '/courier-prices' },
    { title: 'Create', href: '/courier-prices/create' },
  ]

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    carrier_name: '',
    service_type: 'standard',
    base_price: '',
    per_kg_price: '',
    surcharge: '',
    transit_days: '',
    coverage_area: '',
    is_active: true,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/courier-prices')
  }

  const carriers = ['FedEx', 'UPS', 'DHL', 'TNT', 'Aramex', 'Blue Dart', 'Ecom Express', 'First Flight']

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Courier Price" />
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
                    placeholder="e.g., FedEx Express Domestic"
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

            {/* Carrier Info */}
            <Card>
              <CardHeader>
                <CardTitle>Carrier Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Carrier Name *</label>
                  <Select value={data.carrier_name} onValueChange={(value) => setData('carrier_name', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((carrier) => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.carrier_name && <p className="mt-1 text-sm text-red-600">{errors.carrier_name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">Service Type *</label>
                  <Select value={data.service_type} onValueChange={(value) => setData('service_type', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                      <SelectItem value="economy">Economy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Coverage Area *</label>
                  <Input
                    value={data.coverage_area}
                    onChange={(e) => setData('coverage_area', e.target.value)}
                    placeholder="e.g., All India"
                    className="mt-1"
                  />
                  {errors.coverage_area && <p className="mt-1 text-sm text-red-600">{errors.coverage_area}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Base Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.base_price}
                      onChange={(e) => setData('base_price', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.base_price && <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Per KG Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.per_kg_price}
                      onChange={(e) => setData('per_kg_price', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.per_kg_price && <p className="mt-1 text-sm text-red-600">{errors.per_kg_price}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Surcharge *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.surcharge}
                      onChange={(e) => setData('surcharge', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.surcharge && <p className="mt-1 text-sm text-red-600">{errors.surcharge}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Transit Days *</label>
                    <Input
                      type="number"
                      value={data.transit_days}
                      onChange={(e) => setData('transit_days', e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                    {errors.transit_days && <p className="mt-1 text-sm text-red-600">{errors.transit_days}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/courier-prices">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
