import { formatDistanceToNow } from 'date-fns'
import { Trash2, CheckSquare, AlertCircle } from 'lucide-react'
import { usePage, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Notification {
  id: number
  type: string
  channel: string
  status: string
  subject: string
  message: string
  sent_at: string
  read_at: string | null
  created_at: string
}

interface Props {
  [key: string]: any
  notifications: {
    data: Notification[]
    total: number
    current_page: number
    last_page: number
  }
  unreadCount: number
}

export default function NotificationsIndex() {
  const { notifications, unreadCount } = usePage<Props>().props

  const handleMarkAsRead = (id: number) => {
    router.patch(`/notifications/${id}/mark-as-read`)
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this notification?')) {
      router.delete(`/notifications/${id}`)
    }
  }

  const handleMarkAllAsRead = () => {
    router.patch('/notifications/mark-all-as-read')
  }

  const handleClear = () => {
    if (confirm('Clear all notifications?')) {
      router.post('/notifications/clear')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return '📧'
      case 'sms':
        return '💬'
      case 'in_app':
        return '🔔'
      default:
        return '📬'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount} unread notifications
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/notifications/preferences">
              <Button variant="outline">Preferences</Button>
            </Link>
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckSquare className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button onClick={handleClear} variant="destructive">
              Clear All
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {notifications.data.length > 0 ? (
            notifications.data.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.status === 'read'
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getChannelIcon(notification.channel)}</span>
                      <h3 className="font-semibold text-lg">
                        {notification.subject}
                      </h3>
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {notification.status !== 'read' && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        size="sm"
                        variant="outline"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(notification.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
