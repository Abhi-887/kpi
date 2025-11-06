import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Plus } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

export default function PriceListsIndex() {
  const { priceLists = { data: [] } } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Price Lists', href: '/price-lists' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Price Lists" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Price Lists</h1>
          <Link href="/price-lists/create">
            <Button><Plus className="w-4 h-4 mr-2" />Add Price</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price Lists ({priceLists?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Item ID</th>
                  <th className="text-right py-2 px-2">Base Price</th>
                  <th className="text-right py-2 px-2">Min Qty</th>
                  <th className="text-right py-2 px-2">Max Qty</th>
                  <th className="text-right py-2 px-2">Discount %</th>
                  <th className="text-left py-2 px-2">Customer Group</th>
                </tr>
              </thead>
              <tbody>
                {priceLists?.data?.map((pl: any) => (
                  <tr key={pl.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-2">{pl.item_id}</td>
                    <td className="py-2 px-2 text-right">₹{Number(pl.base_price).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">{pl.min_qty}</td>
                    <td className="py-2 px-2 text-right">{pl.max_qty || '∞'}</td>
                    <td className="py-2 px-2 text-right">{pl.discount_percent}%</td>
                    <td className="py-2 px-2">{pl.customer_group || 'General'}</td>
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
