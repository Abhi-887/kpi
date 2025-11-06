import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useCallback, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { TrendingUp, Package, DollarSign, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Metric {
  totalShipments: number
  deliveredShipments: number
  pendingShipments: number
  shipmentDeliveryRate: number
  totalRevenue: number
  paidRevenue: number
  pendingRevenue: number
  collectionRate: number
  totalOrders: number
  completedOrders: number
  totalCustomers: number
  newCustomers: number
  averageOrderValue: number
  averageShipmentCost: number
}

interface ChartData {
  shipmentsByStatus: Array<{ name: string; value: number }>
  revenueByMonth: Array<{ month: string; amount: number }>
  invoicesByStatus: Array<{ name: string; value: number }>
}

interface TopCustomer {
  id: number
  company_name: string
  contact_email: string
  total_revenue: number
}

interface DashboardProps {
  metrics: Metric
  charts: ChartData
  topCustomers: TopCustomer[]
  dateRange: {
    start_date: string
    end_date: string
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Dashboard({ metrics, charts, topCustomers, dateRange }: DashboardProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
  ]

  const [startDate, setStartDate] = useState(dateRange.start_date)
  const [endDate, setEndDate] = useState(dateRange.end_date)

  const handleDateFilter = useCallback(() => {
    router.get('/dashboard', { start_date: startDate, end_date: endDate }, { preserveScroll: true })
  }, [startDate, endDate])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor your business metrics and KPIs</p>
        </div>

        {/* Date Filter */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-semibold">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <Button onClick={handleDateFilter}>Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Shipments KPI */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalShipments}</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>{metrics.deliveredShipments} delivered</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Rate KPI */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.shipmentDeliveryRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{metrics.deliveredShipments} of {metrics.totalShipments} delivered</p>
            </CardContent>
          </Card>

          {/* Revenue KPI */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>${metrics.paidRevenue.toLocaleString()} paid</span>
              </div>
            </CardContent>
          </Card>

          {/* Collection Rate KPI */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.collectionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">${metrics.pendingRevenue.toLocaleString()} pending</p>
            </CardContent>
          </Card>

          {/* Orders KPI */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOrders}</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>{metrics.completedOrders} completed</span>
              </div>
            </CardContent>
          </Card>

          {/* Customers KPI */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">{metrics.newCustomers} new customers</p>
            </CardContent>
          </Card>

          {/* Avg Order Value */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.averageOrderValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Per order</p>
            </CardContent>
          </Card>

          {/* Avg Shipment Cost */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Shipment Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.averageShipmentCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Per shipment</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Revenue by Month */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Shipments by Status */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Shipments by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.shipmentsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Invoices by Status */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Invoices by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.invoicesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }: any) => `${name}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.invoicesByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{index + 1}. {customer.company_name}</p>
                      <p className="text-xs text-muted-foreground">{customer.contact_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${customer.total_revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
