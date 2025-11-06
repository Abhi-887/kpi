import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/layouts/app-layout'
import { Link, useForm } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

export default function CreateForwardingPrice() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forwarding Prices', href: '/forwarding-prices' },
    { title: 'Create', href: '/forwarding-prices/create' },
  ]

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    origin_country: '',
    destination_country: '',
    service_type: 'standard',
    base_price: '',
    per_kg_price: '',
    per_cbm_price: '',
    handling_fee: '',
    transit_days: '',
    is_active: true,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/forwarding-prices')
  }

  const countries = ['India', 'USA', 'UK', 'Japan', 'Singapore', 'Australia', 'Canada', 'Germany', 'France', 'UAE']

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Forwarding Price" />
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
                    placeholder="e.g., India to USA Express"
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

            {/* Route Info */}
            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Origin Country *</label>
                    <Select value={data.origin_country} onValueChange={(value) => setData('origin_country', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.origin_country && <p className="mt-1 text-sm text-red-600">{errors.origin_country}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Destination Country *</label>
                    <Select value={data.destination_country} onValueChange={(value) => setData('destination_country', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.destination_country && <p className="mt-1 text-sm text-red-600">{errors.destination_country}</p>}
                  </div>
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
                    <label className="text-sm font-medium">Per CBM Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.per_cbm_price}
                      onChange={(e) => setData('per_cbm_price', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.per_cbm_price && <p className="mt-1 text-sm text-red-600">{errors.per_cbm_price}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Handling Fee *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.handling_fee}
                      onChange={(e) => setData('handling_fee', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.handling_fee && <p className="mt-1 text-sm text-red-600">{errors.handling_fee}</p>}
                  </div>
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
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/forwarding-prices">
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
