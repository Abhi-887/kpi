import { usePage, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft } from 'lucide-react'

interface AuditLog {
  id: number
  user_id: number | null
  action: string
  model_type: string
  model_id: number | null
  description: string | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: {
    id: number
    name: string
    email: string
  }
}

interface Props {
  [key: string]: any
  log: AuditLog
}

export default function AuditLogShow() {
  const { log } = usePage<Props>().props

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
        { title: `Log #${log.id}`, href: `/audit-logs/${log.id}` },
      ]}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href="/audit-logs">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Logs
            </Button>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Audit Log #{log.id}</h1>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Event Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Action</div>
                <Badge className={getActionColor(log.action)}>
                  {log.action}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Model</div>
                <div className="font-semibold">{log.model_type.replace(/.*\\/, '')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Model ID</div>
                <div className="font-mono text-sm">{log.model_id || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Timestamp</div>
                <div className="text-sm">{new Date(log.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* User Information */}
          {log.user && (
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4">User Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
                  <div className="font-semibold">{log.user.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                  <div className="text-sm">{log.user.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Request Information */}
          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Request Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">IP Address</div>
                <div className="font-mono text-sm">{log.ip_address || 'Unknown'}</div>
              </div>
              {log.user_agent && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">User Agent</div>
                  <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono overflow-auto max-h-20">
                    {log.user_agent}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Changes */}
          {(log.old_values || log.new_values) && (
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Changes</h2>
              <div className="space-y-4">
                {log.old_values && Object.keys(log.old_values).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Previous Values</h3>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded font-mono text-xs overflow-auto max-h-48">
                      <pre>{JSON.stringify(log.old_values, null, 2)}</pre>
                    </div>
                  </div>
                )}
                {log.new_values && Object.keys(log.new_values).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">New Values</h3>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded font-mono text-xs overflow-auto max-h-48">
                      <pre>{JSON.stringify(log.new_values, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {log.description && (
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">{log.description}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
