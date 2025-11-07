import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Plus } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

export default function TaxCodesIndex() {
  const { taxCodes = { data: [] } } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tax Codes', href: '/tax-codes' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tax Codes" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tax Codes</h1>
          <Link href="/tax-codes/create">
            <Button><Plus className="w-4 h-4 mr-2" />Add Tax Code</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tax Codes ({taxCodes?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-right py-3 px-4 font-medium">Rate %</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Applicability</th>
                  </tr>
                </thead>
                <tbody>
                  {taxCodes?.data?.map((tax: any) => (
                    <tr key={tax.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">{tax.tax_code}</td>
                      <td className="py-3 px-4">{tax.tax_name}</td>
                      <td className="py-3 px-4 text-right font-semibold">{tax.rate}%</td>
                      <td className="py-3 px-4"><Badge variant="outline">{tax.tax_type}</Badge></td>
                      <td className="py-3 px-4"><Badge variant="secondary">{tax.applicability}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {taxCodes?.data?.length === 0 && <div className="text-center py-8 text-muted-foreground">No tax codes found</div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
