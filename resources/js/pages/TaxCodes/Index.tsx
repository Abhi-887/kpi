import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="space-y-6">
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
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Code</th>
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-right py-2 px-2">Rate %</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Applicability</th>
                </tr>
              </thead>
              <tbody>
                {taxCodes?.data?.map((tax: any) => (
                  <tr key={tax.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-2 font-mono">{tax.tax_code}</td>
                    <td className="py-2 px-2">{tax.tax_name}</td>
                    <td className="py-2 px-2 text-right font-semibold">{tax.rate}%</td>
                    <td className="py-2 px-2">{tax.tax_type}</td>
                    <td className="py-2 px-2">{tax.applicability}</td>
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
