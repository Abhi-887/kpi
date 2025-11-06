import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

export default function CreateRateCard() {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Rate Cards',
      href: '/rate-cards',
    },
    {
      title: 'Create',
      href: '/rate-cards/create',
    },
  ]

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    status: 'active',
    service_type: 'standard',
    origin_country: '',
    destination_country: '',
    base_rate: '',
    minimum_charge: '',
    surcharge_percentage: '',
    is_zone_based: false,
    valid_days: '365',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/rate-cards')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Rate Card" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-3xl">
          <form onSubmit={submit} className="space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Rate Card Name *</label>
                  <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., India to USA - Express"
                    className="mt-1"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={data.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                    placeholder="Additional details about this rate card"
                    className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status *</label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
              </CardContent>
            </Card>

            {/* Route Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Origin Country *</label>
                    <Input
                      value={data.origin_country}
                      onChange={(e) => setData('origin_country', e.target.value)}
                      placeholder="e.g., India"
                      className="mt-1"
                    />
                    {errors.origin_country && <p className="text-red-600 text-sm mt-1">{errors.origin_country}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Destination Country *</label>
                    <Input
                      value={data.destination_country}
                      onChange={(e) => setData('destination_country', e.target.value)}
                      placeholder="e.g., USA"
                      className="mt-1"
                    />
                    {errors.destination_country && <p className="text-red-600 text-sm mt-1">{errors.destination_country}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Base Rate (per kg) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.base_rate}
                      onChange={(e) => setData('base_rate', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.base_rate && <p className="text-red-600 text-sm mt-1">{errors.base_rate}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Minimum Charge *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.minimum_charge}
                      onChange={(e) => setData('minimum_charge', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.minimum_charge && <p className="text-red-600 text-sm mt-1">{errors.minimum_charge}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Surcharge Percentage (%)*</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.surcharge_percentage}
                      onChange={(e) => setData('surcharge_percentage', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.surcharge_percentage && <p className="text-red-600 text-sm mt-1">{errors.surcharge_percentage}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Valid Days *</label>
                    <Input
                      type="number"
                      value={data.valid_days}
                      onChange={(e) => setData('valid_days', e.target.value)}
                      placeholder="365"
                      className="mt-1"
                    />
                    {errors.valid_days && <p className="text-red-600 text-sm mt-1">{errors.valid_days}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="zone_based"
                    checked={data.is_zone_based}
                    onChange={(e) => setData('is_zone_based', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="zone_based" className="text-sm font-medium">
                    Zone Based Pricing
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/rate-cards">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create Rate Card'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
