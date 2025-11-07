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
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Item ID</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-right py-3 px-4 font-medium">Unit Cost</th>
                    <th className="text-right py-3 px-4 font-medium">Factor</th>
                    <th className="text-left py-3 px-4 font-medium">Effective From</th>
                  </tr>
                </thead>
                <tbody>
                  {costComponents?.data?.map((cc: any) => (
                    <tr key={cc.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">{cc.item_id}</td>
                      <td className="py-3 px-4">{cc.component_type}</td>
                      <td className="py-3 px-4 text-right">₹{Number(cc.unit_cost).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">{Number(cc.quantity_factor).toFixed(4)}</td>
                      <td className="py-3 px-4">{cc.effective_from}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {costComponents?.data?.length === 0 && <div className="text-center py-8 text-muted-foreground">No cost components found</div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
