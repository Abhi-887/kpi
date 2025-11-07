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
    <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-3 max-w-md">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.variant as keyof typeof iconMap]
        return (
          <div key={alert.id} className="pointer-events-auto">
            <Alert variant={alert.variant as any} className="flex items-start gap-4">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">{alert.title}</div>
                {alert.description && (
                  <div className="text-sm opacity-90">{alert.description}</div>
                )}
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="flex-shrink-0 ml-2 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          </div>
        )
      })}
    </div>
  )
}
