import { useState } from 'react'

export interface Alert {
  id: string
  title: string
  description?: string
  variant: 'default' | 'destructive' | 'success' | 'warning' | 'info'
}

export function useAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const showAlert = (
    title: string,
    description?: string,
    variant: Alert['variant'] = 'default',
    duration = 5000
  ) => {
    const id = Date.now().toString()
    const alert: Alert = { id, title, description, variant }

    setAlerts((prev) => [...prev, alert])

    if (duration > 0) {
      setTimeout(() => {
        dismissAlert(id)
      }, duration)
    }

    return id
  }

  return {
    alerts,
    dismissAlert,
    showAlert,
    success: (title: string, description?: string) =>
      showAlert(title, description, 'success'),
    error: (title: string, description?: string) =>
      showAlert(title, description, 'destructive'),
    warning: (title: string, description?: string) =>
      showAlert(title, description, 'warning'),
    info: (title: string, description?: string) =>
      showAlert(title, description, 'info'),
  }
}
