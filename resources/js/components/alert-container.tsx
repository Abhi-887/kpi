import { Alert } from '@/components/ui/alert'
import { type Alert as AlertType } from '@/hooks/use-alert'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface AlertContainerProps {
  alerts: AlertType[]
  onDismiss: (id: string) => void
}

const iconMap = {
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
}

export function AlertContainer({ alerts, onDismiss }: AlertContainerProps) {
  if (alerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-2 max-w-md w-full px-4">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.variant as keyof typeof iconMap]
        return (
          <div key={alert.id} className="pointer-events-auto animate-in fade-in slide-in-from-right-full duration-300">
            <div 
              className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${
                alert.variant === 'success' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                  : alert.variant === 'destructive'
                  ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                  : alert.variant === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
              }`}
            >
              <Icon 
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  alert.variant === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : alert.variant === 'destructive'
                    ? 'text-red-600 dark:text-red-400'
                    : alert.variant === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              />
              <div className="flex-1">
                <div className={`font-semibold ${
                  alert.variant === 'success'
                    ? 'text-green-900 dark:text-green-100'
                    : alert.variant === 'destructive'
                    ? 'text-red-900 dark:text-red-100'
                    : alert.variant === 'warning'
                    ? 'text-yellow-900 dark:text-yellow-100'
                    : 'text-blue-900 dark:text-blue-100'
                }`}>
                  {alert.title}
                </div>
                {alert.description && (
                  <div className={`text-sm mt-1 ${
                    alert.variant === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : alert.variant === 'destructive'
                      ? 'text-red-800 dark:text-red-200'
                      : alert.variant === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {alert.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className={`flex-shrink-0 ml-2 opacity-50 hover:opacity-100 transition-opacity ${
                  alert.variant === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : alert.variant === 'destructive'
                    ? 'text-red-600 dark:text-red-400'
                    : alert.variant === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
