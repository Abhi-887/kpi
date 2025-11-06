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
  carrierTypes: string[]
}

export default function Create({ carrierTypes }: CreateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Integrations', href: '/integrations/carriers' },
    { title: 'Carriers', href: '/integrations/carriers' },
    { title: 'Add Carrier', href: '/integrations/carriers/create' },
  ]

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    carrier_type: '',
    api_key: '',
    api_secret: '',
    account_number: '',
    is_test_mode: false,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/integrations/carriers')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Carrier Integration" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="mb-4 flex items-center gap-4">
          <Link href="/integrations/carriers">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add Carrier Integration</h1>
            <p className="text-sm text-muted-foreground">Connect a new shipping carrier API</p>
          </div>
        </div>

        <Card className="dark:bg-gray-900 dark:border-gray-800 max-w-2xl">
          <CardHeader>
            <CardTitle>Carrier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Name</label>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., FedEx Production"
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Carrier Type</label>
                <Select value={data.carrier_type} onValueChange={(v) => setData('carrier_type', v)}>
                  <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {carrierTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.carrier_type && <p className="text-sm text-red-600 mt-1">{errors.carrier_type}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">API Key</label>
                <Input
                  type="password"
                  value={data.api_key}
                  onChange={(e) => setData('api_key', e.target.value)}
                  placeholder="Your API key"
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
                {errors.api_key && <p className="text-sm text-red-600 mt-1">{errors.api_key}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">API Secret (Optional)</label>
                <Input
                  type="password"
                  value={data.api_secret}
                  onChange={(e) => setData('api_secret', e.target.value)}
                  placeholder="Your API secret"
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Account Number (Optional)</label>
                <Input
                  type="text"
                  value={data.account_number}
                  onChange={(e) => setData('account_number', e.target.value)}
                  placeholder="Account number if applicable"
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
                  {processing ? 'Creating...' : 'Create Integration'}
                </Button>
                <Link href="/integrations/carriers">
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
