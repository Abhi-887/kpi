import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link, router, usePage } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface TaxCode {
  id: number
  tax_code: string
  tax_name: string
  rate: number
  tax_type: string
  applicability: string
  is_active: boolean
  effective_from: string
  effective_to?: string
}

interface PaginatedResponse {
  data: TaxCode[]
  total: number
  current_page: number
  last_page: number
  path: string
  per_page: number
}

interface PageProps {
  taxCodes: PaginatedResponse
  filters?: Record<string, any>
}

export default function TaxCodesIndex() {
  const { taxCodes, filters = {} } = usePage().props as any

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tax Codes', href: '/tax-codes' },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [taxType, setTaxType] = useState(filters.tax_type || '')
  const [active, setActive] = useState(filters.active || '')

  const handleSearch = () => {
    router.get('/tax-codes', { search, tax_type: taxType, active }, { preserveScroll: true })
  }

  const handleReset = () => {
    setSearch('')
    setTaxType('')
    setActive('')
    router.get('/tax-codes', {}, { preserveScroll: true })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this tax code?')) {
      router.delete(`/tax-codes/${id}`)
    }
  }

  const handlePaginate = (page: number) => {
    router.get(
      `/tax-codes?page=${page}`,
      { search, tax_type: taxType, active },
      { preserveScroll: true }
    )
  }

  const getTaxTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      IGST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
      CGST: 'bg-green-100 text-green-800 dark:bg-green-900/30',
      SGST: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30',
      VAT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30',
      Other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30',
    }
    return colors[type] || colors.Other
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tax Codes" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tax Codes</h1>
          <Link href="/tax-codes/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Tax Code
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <Input
                  placeholder="Tax Code or Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tax Type</label>
                <Select value={taxType || 'all'} onValueChange={setTaxType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IGST">IGST</SelectItem>
                    <SelectItem value="CGST">CGST</SelectItem>
                    <SelectItem value="SGST">SGST</SelectItem>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={active || 'all'} onValueChange={setActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">&nbsp;</label>
                <div className="flex gap-2">
                  <Button onClick={handleSearch} variant="default" className="flex-1">
                    <Search className="w-4 h-4 mr-2" /> Search
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Codes ({taxCodes?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-right py-3 px-4 font-medium">Rate %</th>
                    <th className="text-center py-3 px-4 font-medium">Type</th>
                    <th className="text-center py-3 px-4 font-medium">Applicability</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taxCodes?.data?.map((taxCode: TaxCode) => (
                    <tr key={taxCode.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs font-medium">{taxCode.tax_code}</td>
                      <td className="py-3 px-4">{taxCode.tax_name}</td>
                      <td className="py-3 px-4 text-right font-semibold">{Number(taxCode.rate).toFixed(2)}%</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getTaxTypeColor(taxCode.tax_type)}>
                          {taxCode.tax_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline">{taxCode.applicability}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={
                            taxCode.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30'
                          }
                        >
                          {taxCode.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Link href={`/tax-codes/${taxCode.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(taxCode.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {taxCodes?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No tax codes found</div>
            )}

            {taxCodes && taxCodes.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: taxCodes.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePaginate(page)}
                    variant={page === taxCodes.current_page ? 'default' : 'outline'}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
