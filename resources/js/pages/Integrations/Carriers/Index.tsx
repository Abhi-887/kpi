import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Plus, Edit, Trash2, TestTube, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface Carrier {
  id: number
  name: string
  carrier_type: string
  is_active: boolean
  is_test_mode: boolean
  status_badge: string
  last_tested_at: string | null
}

interface IndexProps {
  carriers: Carrier[]
}

export default function Index({ carriers }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Integrations', href: '/integrations/carriers' },
    { title: 'Carriers', href: '/integrations/carriers' },
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
      <Head title="Carrier Integrations" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carrier Integrations</h1>
            <p className="text-sm text-muted-foreground">Manage shipping carrier API integrations</p>
          </div>
          <Link href="/integrations/carriers/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Carrier
            </Button>
          </Link>
        </div>

        {carriers.length === 0 ? (
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No carrier integrations yet. Add your first carrier integration.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {carriers.map((carrier) => (
              <Card key={carrier.id} className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{carrier.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{carrier.carrier_type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(carrier.status_badge)}
                      <Badge variant={carrier.is_active ? 'default' : 'secondary'}>
                        {carrier.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold">Status: {carrier.status_badge}</p>
                    <p className="text-xs text-muted-foreground">
                      {carrier.last_tested_at ? `Last tested: ${carrier.last_tested_at}` : 'Never tested'}
                    </p>
                  </div>

                  {carrier.is_test_mode && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Test Mode
                    </Badge>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <TestTube className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Link href={`/integrations/carriers/${carrier.id}/edit`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
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
