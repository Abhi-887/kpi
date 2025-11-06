import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Plus } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

export default function CostComponentsIndex() {
  const { costComponents = { data: [] } } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cost Components', href: '/cost-components' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Cost Components" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cost Components</h1>
          <Link href="/cost-components/create">
            <Button><Plus className="w-4 h-4 mr-2" />Add Component</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cost Components ({costComponents?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Item ID</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-right py-2 px-2">Unit Cost</th>
                  <th className="text-right py-2 px-2">Factor</th>
                  <th className="text-left py-2 px-2">Effective From</th>
                </tr>
              </thead>
              <tbody>
                {costComponents?.data?.map((cc: any) => (
                  <tr key={cc.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-2">{cc.item_id}</td>
                    <td className="py-2 px-2">{cc.component_type}</td>
                    <td className="py-2 px-2 text-right">₹{Number(cc.unit_cost).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{Number(cc.quantity_factor).toFixed(4)}</td>
                    <td className="py-2 px-2">{cc.effective_from}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
