import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useForm } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { ArrowLeft } from 'lucide-react'

interface CreateProps {
  gatewayTypes: string[]
}

export default function Create({ gatewayTypes }: CreateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Integrations', href: '/integrations/payment-gateways' },
    { title: 'Payment Gateways', href: '/integrations/payment-gateways' },
    { title: 'Add Gateway', href: '/integrations/payment-gateways/create' },
  ]

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    gateway_type: '',
    public_key: '',
    secret_key: '',
    merchant_id: '',
    is_test_mode: false,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/integrations/payment-gateways')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Payment Gateway" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="mb-4 flex items-center gap-4">
          <Link href="/integrations/payment-gateways">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add Payment Gateway</h1>
            <p className="text-sm text-muted-foreground">Connect a new payment processor</p>
          </div>
        </div>

        <Card className="dark:bg-gray-900 dark:border-gray-800 max-w-2xl">
          <CardHeader>
            <CardTitle>Gateway Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Name</label>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., Stripe Live"
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Gateway Type</label>
                <Select value={data.gateway_type} onValueChange={(v) => setData('gateway_type', v)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue placeholder="Select gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    {gatewayTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gateway_type && <p className="text-sm text-red-600 mt-1">{errors.gateway_type}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Public Key</label>
                <Input
                  type="password"
                  value={data.public_key}
                  onChange={(e) => setData('public_key', e.target.value)}
                  placeholder="Your public key"
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
                {errors.public_key && <p className="text-sm text-red-600 mt-1">{errors.public_key}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Secret Key</label>
                <Input
                  type="password"
                  value={data.secret_key}
                  onChange={(e) => setData('secret_key', e.target.value)}
                  placeholder="Your secret key"
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
                {errors.secret_key && <p className="text-sm text-red-600 mt-1">{errors.secret_key}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Merchant ID (Optional)</label>
                <Input
                  type="text"
                  value={data.merchant_id}
                  onChange={(e) => setData('merchant_id', e.target.value)}
                  placeholder="Merchant ID if applicable"
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.is_test_mode}
                  onChange={(e) => setData('is_test_mode', e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm font-semibold">Test Mode</label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Gateway'}
                </Button>
                <Link href="/integrations/payment-gateways">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
