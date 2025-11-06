import { usePage, Form } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface Props {
  [key: string]: any
  generalSettings: Record<string, any>
  emailSettings: Record<string, any>
  shippingSettings: Record<string, any>
  paymentSettings: Record<string, any>
  advancedSettings: Record<string, any>
}

export default function SettingsIndex() {
  const { generalSettings, emailSettings, shippingSettings, paymentSettings, advancedSettings } =
    usePage<Props>().props

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Admin', href: '/admin' },
        { title: 'Settings', href: '/admin/settings' },
      ]}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
            Manage global application configuration and preferences
          </p>
        </div>

        <Form method="patch" action="/admin/settings">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6">
              <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
              <TabsTrigger value="email" className="text-xs sm:text-sm">Email</TabsTrigger>
              <TabsTrigger value="shipping" className="text-xs sm:text-sm">Shipping</TabsTrigger>
              <TabsTrigger value="payment" className="text-xs sm:text-sm">Payment</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="app_name">Application Name</Label>
                  <Input
                    id="app_name"
                    name="app_name"
                    defaultValue={generalSettings.app_name}
                    placeholder="KPI System"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue={generalSettings.currency || 'USD'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select name="timezone" defaultValue={generalSettings.timezone || 'UTC'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                        <SelectItem value="America/Denver">America/Denver</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    name="smtp_host"
                    defaultValue={emailSettings.smtp_host}
                    placeholder="smtp.mailtrap.io"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      name="smtp_port"
                      type="number"
                      defaultValue={emailSettings.smtp_port}
                      placeholder="465"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification_email">Notification Email</Label>
                    <Input
                      id="notification_email"
                      name="notification_email"
                      type="email"
                      defaultValue={emailSettings.notification_email}
                      placeholder="notifications@kpisystem.local"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="space-y-6">
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="default_shipping_carrier">Default Carrier</Label>
                  <Select
                    name="default_shipping_carrier"
                    defaultValue={shippingSettings.default_shipping_carrier || 'fedex'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="usps">USPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="enable_tracking"
                    name="enable_tracking"
                    defaultChecked={shippingSettings.enable_tracking === '1' || shippingSettings.enable_tracking === true}
                    value="1"
                  />
                  <Label htmlFor="enable_tracking" className="cursor-pointer">
                    Enable Shipment Tracking
                  </Label>
                </div>
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="default_payment_gateway">Default Payment Gateway</Label>
                  <Select
                    name="default_payment_gateway"
                    defaultValue={paymentSettings.default_payment_gateway || 'stripe'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="enable_auto_invoicing"
                    name="enable_auto_invoicing"
                    defaultChecked={paymentSettings.enable_auto_invoicing === '1' || paymentSettings.enable_auto_invoicing === true}
                    value="1"
                  />
                  <Label htmlFor="enable_auto_invoicing" className="cursor-pointer">
                    Auto-generate Invoices for Orders
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_due_days">Invoice Due Days</Label>
                  <Input
                    id="invoice_due_days"
                    name="invoice_due_days"
                    type="number"
                    min="1"
                    max="365"
                    defaultValue={paymentSettings.invoice_due_days}
                    placeholder="30"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 sm:p-4 rounded-lg flex gap-3 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Caution:</strong> These settings affect system performance and security. Modify only if you know what you're doing.
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="enable_api_logging"
                    name="enable_api_logging"
                    defaultChecked={advancedSettings.enable_api_logging === '1' || advancedSettings.enable_api_logging === true}
                    value="1"
                  />
                  <Label htmlFor="enable_api_logging" className="cursor-pointer">
                    Enable API Request Logging
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_file_upload_size">Max File Upload Size (bytes)</Label>
                  <Input
                    id="max_file_upload_size"
                    name="max_file_upload_size"
                    type="number"
                    min="1048576"
                    defaultValue={advancedSettings.max_file_upload_size}
                    placeholder="10485760"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Default: 10MB (10485760 bytes)
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button type="submit" size="lg">
              Save Settings
            </Button>
            <Form method="post" action="/admin/settings/reset">
              <Button type="submit" variant="destructive" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </Form>
          </div>
        </Form>
      </div>
    </AppLayout>
  )
}
