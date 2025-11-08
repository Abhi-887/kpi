import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Plus, Search, Eye, Trash2, TrendingUp } from 'lucide-react'
import { Head } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'

interface Rate {
  id: number
  from_currency: string
  to_currency: string
  rate: number
  effective_date: string
  source: string
  status: string
}

interface PageProps {
  activePairs?: Record<string, any>
  recentRates?: Rate[]
  today?: string
}

const sourceColors: Record<string, string> = {
  manual: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  api: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  imported: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
}

export default function ExchangeRatesIndex() {
  const { activePairs = {}, recentRates = [], today } = usePage().props as any as PageProps

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Exchange Rates',
      href: '/exchange-rates',
    },
  ]

  const [search, setSearch] = useState('')

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this exchange rate?')) {
      router.delete(`/exchange-rates/${id}`)
    }
  }

  const pairCount = Object.keys(activePairs).length
  const rateCount = recentRates?.length || 0

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Exchange Rates" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Exchange Rates</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage currency conversion rates for accurate historical pricing</p>
          </div>
          <Link href="/exchange-rates/create">
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Update Rates
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pairCount}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Currency pairs configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rateCount}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Exchange rate records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{today}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rates Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      To
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Effective Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rateCount === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No exchange rates found. <Link href="/exchange-rates/create" className="text-blue-600 dark:text-blue-400 hover:underline">Create one</Link></p>
                      </td>
                    </tr>
                  ) : (
                    recentRates?.map((rate) => (
                      <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold">{rate.from_currency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold">{rate.to_currency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="font-mono font-semibold">{(rate.rate as unknown as number).toFixed(6)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(rate.effective_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={sourceColors[rate.source] || sourceColors['manual']}>
                            {rate.source}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusColors[rate.status] || statusColors['active']}>
                            {rate.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(rate.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
