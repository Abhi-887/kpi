import { createContext, useContext, ReactNode } from 'react'
import { AlertContainer } from '@/components/alert-container'
import { useAlert, type Alert } from '@/hooks/use-alert'

interface AlertContextType {
  alerts: Alert[]
  dismissAlert: (id: string) => void
  showAlert: (title: string, description?: string, variant?: Alert['variant'], duration?: number) => string
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const alert = useAlert()

  return (
    <AlertContext.Provider value={alert}>
      {children}
      <AlertContainer alerts={alert.alerts} onDismiss={alert.dismissAlert} />
    </AlertContext.Provider>
  )
}

export function useAlertContext() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlertContext must be used within AlertProvider')
  }
  return context
}
