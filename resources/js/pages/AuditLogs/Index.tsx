import { usePage, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDistanceToNow } from 'date-fns'
import { Download, Eye } from 'lucide-react'

interface Log {
  id: number
  user_id: number | null
  action: string
  model_type: string
  model_id: number | null
  description: string | null
  ip_address: string | null
  created_at: string
  user?: {
    id: number
    name: string
    email: string
  }
}

interface Props {
  [key: string]: any
  logs: {
    data: Log[]
    current_page: number
    last_page: number
    total: number
  }
  filters: Record<string, any>
}

export default function AuditLogsIndex() {
  const { logs, filters } = usePage<Props>().props

  const handleExport = () => {
    router.get('/audit-logs/export/csv', filters, { preserveScroll: true })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'view':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'export':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Admin', href: '/admin' },
        { title: 'Audit Logs', href: '/audit-logs' },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
              Total: {logs.total} events
            </p>
          </div>

          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="action" className="text-xs sm:text-sm">Action</Label>
              <select
                id="action"
                defaultValue={filters.action || 'all'}
                onChange={(e) => router.get('/audit-logs', { ...filters, action: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
                <option value="export">Export</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_type" className="text-xs sm:text-sm">Model</Label>
              <select
                id="model_type"
                defaultValue={filters.model_type || 'all'}
                onChange={(e) => router.get('/audit-logs', { ...filters, model_type: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Models</option>
                <option value="User">User</option>
                <option value="Shipment">Shipment</option>
                <option value="Order">Order</option>
                <option value="Invoice">Invoice</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_date" className="text-xs sm:text-sm">From Date</Label>
              <Input
                id="from_date"
                type="date"
                defaultValue={filters.from_date || ''}
                onChange={(e) => router.get('/audit-logs', { ...filters, from_date: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_date" className="text-xs sm:text-sm">To Date</Label>
              <Input
                id="to_date"
                type="date"
                defaultValue={filters.to_date || ''}
                onChange={(e) => router.get('/audit-logs', { ...filters, to_date: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2 flex items-end">
              <Button
                onClick={() => router.get('/audit-logs')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Model</th>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">IP Address</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.length > 0 ? (
                logs.data.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {log.model_type.replace(/.*\\/, '')}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div className="text-sm">
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <div className="text-sm">
                        {new Date(log.created_at).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/audit-logs/${log.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {logs.current_page} of {logs.last_page}
          </p>
          <div className="flex gap-2">
            {logs.current_page > 1 && (
              <Button
                onClick={() => router.get('/audit-logs', { ...filters, page: logs.current_page - 1 })}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
            )}
            {logs.current_page < logs.last_page && (
              <Button
                onClick={() => router.get('/audit-logs', { ...filters, page: logs.current_page + 1 })}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
