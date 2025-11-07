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
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Item ID</th>
                    <th className="text-right py-3 px-4 font-medium">Base Price</th>
                    <th className="text-right py-3 px-4 font-medium">Min Qty</th>
                    <th className="text-right py-3 px-4 font-medium">Max Qty</th>
                    <th className="text-right py-3 px-4 font-medium">Discount %</th>
                    <th className="text-left py-3 px-4 font-medium">Customer Group</th>
                  </tr>
                </thead>
                <tbody>
                  {priceLists?.data?.map((pl: any) => (
                    <tr key={pl.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">{pl.item_id}</td>
                      <td className="py-3 px-4 text-right">₹{Number(pl.base_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">{pl.min_qty}</td>
                      <td className="py-3 px-4 text-right">{pl.max_qty || '∞'}</td>
                      <td className="py-3 px-4 text-right">{pl.discount_percent}%</td>
                      <td className="py-3 px-4">{pl.customer_group || 'General'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {priceLists?.data?.length === 0 && <div className="text-center py-8 text-muted-foreground">No price lists found</div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
