import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Plus, Trash2, TestTube, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface PaymentGateway {
  id: number
  name: string
  gateway_type: string
  is_active: boolean
  is_test_mode: boolean
  balance: number
  status_badge: string
  last_tested_at: string | null
}

interface IndexProps {
  gateways: PaymentGateway[]
}

export default function Index({ gateways }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Integrations', href: '/integrations/payment-gateways' },
    { title: 'Payment Gateways', href: '/integrations/payment-gateways' },
  ]

  const getStatusIcon = (status: string) => {
    return status === 'Connected' ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : status === 'Failed' ? (
      <AlertCircle className="h-4 w-4 text-red-600" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-600" />
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Payment Gateway Integrations" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment Gateways</h1>
            <p className="text-sm text-muted-foreground">Manage payment processing integrations</p>
          </div>
          <Link href="/integrations/payment-gateways/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Gateway
            </Button>
          </Link>
        </div>

        {gateways.length === 0 ? (
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No payment gateways yet. Add your first payment gateway.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {gateways.map((gateway) => (
              <Card key={gateway.id} className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{gateway.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{gateway.gateway_type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(gateway.status_badge)}
                      <Badge variant={gateway.is_active ? 'default' : 'secondary'}>
                        {gateway.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold">Status: {gateway.status_badge}</p>
                    <p className="text-xs text-muted-foreground">
                      {gateway.last_tested_at ? `Last tested: ${gateway.last_tested_at}` : 'Never tested'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Balance: ${gateway.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>

                  {gateway.is_test_mode && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Test Mode
                    </Badge>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <TestTube className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
