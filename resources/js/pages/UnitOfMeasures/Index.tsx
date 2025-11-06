import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Plus } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

export default function UnitOfMeasuresIndex() {
  const { units = { data: [] } } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Unit of Measures', href: '/unit-of-measures' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Unit of Measures" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Unit of Measures</h1>
          <Link href="/unit-of-measures/create">
            <Button><Plus className="w-4 h-4 mr-2" />Add UoM</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unit of Measures ({units?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Symbol</th>
                  <th className="text-left py-2 px-2">Category</th>
                  <th className="text-right py-2 px-2">Factor</th>
                </tr>
              </thead>
              <tbody>
                {units?.data?.map((unit: any) => (
                  <tr key={unit.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-2">{unit.name}</td>
                    <td className="py-2 px-2 font-mono">{unit.symbol}</td>
                    <td className="py-2 px-2">{unit.category}</td>
                    <td className="py-2 px-2 text-right">{unit.conversion_factor}</td>
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
