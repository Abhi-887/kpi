import { Form } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePage } from '@inertiajs/react'

interface NotificationPreference {
  id: number
  user_id: number
  email_shipment_created: boolean
  email_shipment_updates: boolean
  email_delivery: boolean
  email_order_updates: boolean
  email_payment_updates: boolean
  sms_shipment_created: boolean
  sms_shipment_updates: boolean
  sms_delivery: boolean
  in_app_all: boolean
  notification_frequency: string
  digest_enabled: boolean
}

interface Props {
  [key: string]: any
  preferences: NotificationPreference
}

export default function NotificationPreferences() {
  const { preferences } = usePage<Props>().props

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Notification Preferences
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage how you receive notifications
          </p>
        </div>

        <Form method="patch" action="/notifications/preferences">
          <div className="space-y-8">
            {/* Email Preferences */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="email_shipment_created"
                    name="email_shipment_created"
                    defaultChecked={preferences.email_shipment_created}
                    value="1"
                  />
                  <Label htmlFor="email_shipment_created">
                    Shipment Created
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="email_shipment_updates"
                    name="email_shipment_updates"
                    defaultChecked={preferences.email_shipment_updates}
                    value="1"
                  />
                  <Label htmlFor="email_shipment_updates">
                    Shipment Updates (In Transit, Exceptions)
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="email_delivery"
                    name="email_delivery"
                    defaultChecked={preferences.email_delivery}
                    value="1"
                  />
                  <Label htmlFor="email_delivery">Shipment Delivery</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="email_order_updates"
                    name="email_order_updates"
                    defaultChecked={preferences.email_order_updates}
                    value="1"
                  />
                  <Label htmlFor="email_order_updates">Order Updates</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="email_payment_updates"
                    name="email_payment_updates"
                    defaultChecked={preferences.email_payment_updates}
                    value="1"
                  />
                  <Label htmlFor="email_payment_updates">
                    Payment Updates
                  </Label>
                </div>
              </div>
            </div>

            {/* SMS Preferences */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-4">SMS Notifications</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sms_shipment_created"
                    name="sms_shipment_created"
                    defaultChecked={preferences.sms_shipment_created}
                    value="1"
                  />
                  <Label htmlFor="sms_shipment_created">Shipment Created</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sms_shipment_updates"
                    name="sms_shipment_updates"
                    defaultChecked={preferences.sms_shipment_updates}
                    value="1"
                  />
                  <Label htmlFor="sms_shipment_updates">
                    Shipment Updates
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sms_delivery"
                    name="sms_delivery"
                    defaultChecked={preferences.sms_delivery}
                    value="1"
                  />
                  <Label htmlFor="sms_delivery">Delivery Notifications</Label>
                </div>
              </div>
            </div>

            {/* In-App Preferences */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-4">In-App Notifications</h2>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="in_app_all"
                  name="in_app_all"
                  defaultChecked={preferences.in_app_all}
                  value="1"
                />
                <Label htmlFor="in_app_all">
                  Enable all in-app notifications
                </Label>
              </div>
            </div>

            {/* Frequency */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Notification Frequency</h2>
              <div className="space-y-2">
                <Label htmlFor="notification_frequency">
                  Delivery Frequency
                </Label>
                <Select
                  name="notification_frequency"
                  defaultValue={preferences.notification_frequency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Checkbox
                  id="digest_enabled"
                  name="digest_enabled"
                  defaultChecked={preferences.digest_enabled}
                  value="1"
                />
                <Label htmlFor="digest_enabled">Enable digest emails</Label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2">
              <Button type="submit">Save Preferences</Button>
            </div>
          </div>
        </Form>
      </div>
    </AppLayout>
  )
}
