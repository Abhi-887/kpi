import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ArrowLeft, Pencil } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Item {
  id: number
  item_code: string
  sku: string
  name: string
  description?: string
  category: string
  default_cost: number
  default_price: number
  weight?: number
  length?: number
  width?: number
  height?: number
  hsn_sac?: string
  active_flag: boolean
  version: number
  unit_of_measure?: { id: number; name: string; symbol: string }
  cost_components?: any[]
  price_lists?: any[]
}

export default function ItemShow() {
  const { item } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Items', href: '/items' },
    { title: item.name, href: `/items/${item.id}` },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Item - ${item.name}`} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/items">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </Link>
          <Link href={`/items/${item.id}/edit`}>
            <Button><Pencil className="w-4 h-4 mr-2" />Edit</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Item Code</label>
                <p className="font-mono text-lg">{item.item_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <p className="font-mono text-lg">{item.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg font-semibold">{item.name}</p>
              </div>
              {item.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{item.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <Badge className="mt-1">{item.category}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">UoM</label>
                <p className="text-lg">{item.unit_of_measure?.name} ({item.unit_of_measure?.symbol})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">HSN/SAC Code</label>
                <p className="font-mono">{item.hsn_sac || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Default Cost</label>
                <p className="text-2xl font-bold">₹{Number(item.default_cost).toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Default Price</label>
                <p className="text-2xl font-bold text-green-600">₹{Number(item.default_price).toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Margin</label>
                <p className="text-lg">
                  {item.default_price > 0 
                    ? `${(((item.default_price - item.default_cost) / item.default_price) * 100).toFixed(2)}%`
                    : '-'
                  }
                </p>
              </div>
              <hr className="my-2" />
              <div className="grid grid-cols-2 gap-4">
                {item.length && <div>
                  <label className="text-xs font-medium text-muted-foreground">Length</label>
                  <p className="text-sm">{item.length} cm</p>
                </div>}
                {item.width && <div>
                  <label className="text-xs font-medium text-muted-foreground">Width</label>
                  <p className="text-sm">{item.width} cm</p>
                </div>}
                {item.height && <div>
                  <label className="text-xs font-medium text-muted-foreground">Height</label>
                  <p className="text-sm">{item.height} cm</p>
                </div>}
                {item.weight && <div>
                  <label className="text-xs font-medium text-muted-foreground">Weight</label>
                  <p className="text-sm">{item.weight} kg</p>
                </div>}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge className={item.active_flag ? 'bg-green-100 text-green-800 dark:bg-green-900/30 mt-1' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 mt-1'}>
                  {item.active_flag ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {item.cost_components?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cost Components</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-right py-2 px-2">Unit Cost</th>
                    <th className="text-right py-2 px-2">Factor</th>
                    <th className="text-right py-2 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {item.cost_components.map((cc: any) => (
                    <tr key={cc.id} className="border-b">
                      <td className="py-2 px-2">{cc.component_type}</td>
                      <td className="text-right py-2 px-2">₹{Number(cc.unit_cost).toFixed(2)}</td>
                      <td className="text-right py-2 px-2">{Number(cc.quantity_factor).toFixed(4)}</td>
                      <td className="text-right py-2 px-2 font-semibold">
                        ₹{(Number(cc.unit_cost) * Number(cc.quantity_factor)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
