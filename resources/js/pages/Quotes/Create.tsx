import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Calculator } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface RateCard {
  id: number
  name: string
  origin_country: string
  destination_country: string
  service_type: string
  base_rate: string
  minimum_charge: string
}

interface CreateProps {
  rateCards: Record<string, RateCard[]>
}

export default function Create({ rateCards }: CreateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Quotes',
      href: '/quotes',
    },
    {
      title: 'Generate',
      href: '/quotes/create',
    },
  ]

  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)

  const { data, setData, post, processing, errors } = useForm({
    origin_country: '',
    destination_country: '',
    service_type: 'standard',
    weight: '',
    weight_unit: 'kg',
    currency: 'INR',
    notes: '',
  })

  const handleWeightChange = (weight: string) => {
    setData('weight', weight)
    if (weight && data.origin_country && data.destination_country) {
      estimateCost()
    }
  }

  const estimateCost = () => {
    const weight = parseFloat(data.weight)
    const matching = Object.values(rateCards)
      .flat()
      .find(
        (rc) =>
          rc.origin_country === data.origin_country &&
          rc.destination_country === data.destination_country &&
          rc.service_type === data.service_type
      )

    if (matching && weight) {
      const baseRate = parseFloat(matching.base_rate)
      const minimumCharge = parseFloat(matching.minimum_charge)
      let cost = weight * baseRate
      cost = Math.max(cost, minimumCharge)
      setEstimatedCost(cost)
    } else {
      setEstimatedCost(null)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/quotes')
  }

  const countries = Array.from(
    new Set(
      Object.values(rateCards)
        .flat()
        .flatMap((rc) => [rc.origin_country, rc.destination_country])
    )
  ).sort()

  const serviceTypes = Array.from(
    new Set(Object.values(rateCards).flat().map((rc) => rc.service_type))
  ).sort()

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Generate Quote" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="max-w-3xl">
          <form onSubmit={submit} className="space-y-6">
            {/* Quote Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Origin Country *</label>
                    <Select value={data.origin_country} onValueChange={(value) => setData('origin_country', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select origin" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.origin_country && <p className="text-red-600 text-sm mt-1">{errors.origin_country}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Destination Country *</label>
                    <Select value={data.destination_country} onValueChange={(value) => setData('destination_country', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.destination_country && <p className="text-red-600 text-sm mt-1">{errors.destination_country}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Service Type *</label>
                    <Select value={data.service_type} onValueChange={(value) => setData('service_type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Currency *</label>
                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Card */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Weight *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.weight}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {errors.weight && <p className="text-red-600 text-sm mt-1">{errors.weight}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit *</label>
                    <Select value={data.weight_unit} onValueChange={(value) => setData('weight_unit', value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {estimatedCost !== null && (
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Estimated Base Cost</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{estimatedCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                    placeholder="Any additional notes for this quote..."
                    className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/quotes">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Generating...' : 'Generate Quote'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
