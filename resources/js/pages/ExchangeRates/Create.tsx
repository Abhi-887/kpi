import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'
import { Head, Form, usePage, Link } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'
import { ChevronLeft, Plus, Trash2, AlertCircle } from 'lucide-react'

interface CurrentRate {
  currency: string
  rate: number
  lastUpdated: string
}

interface PageProps {
  currentRates: CurrentRate[]
  today: string
  errors?: Record<string, string[]>
}

export default function ExchangeRatesCreate() {
  const { currentRates = [], today, errors } = usePage().props as any as PageProps

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exchange Rates', href: '/exchange-rates' },
    { title: 'Update Rates', href: '/exchange-rates/create' },
  ]

  const [rates, setRates] = useState<Record<string, string>>(
    currentRates.reduce((acc, r) => {
      if (r.currency) {
        acc[r.currency] = r.rate?.toString() || ''
      }
      return acc
    }, {} as Record<string, string>)
  )

  const [newCurrency, setNewCurrency] = useState('')

  const handleRateChange = (currency: string, value: string) => {
    setRates((prev) => ({
      ...prev,
      [currency]: value,
    }))
  }

  const addCurrency = () => {
    if (newCurrency && newCurrency.length === 3) {
      setRates((prev) => ({
        ...prev,
        [newCurrency.toUpperCase()]: '',
      }))
      setNewCurrency('')
    }
  }

  const removeCurrency = (currency: string) => {
    setRates((prev) => {
      const newRates = { ...prev }
      delete newRates[currency]
      return newRates
    })
  }

  const isFormValid = Object.keys(rates).length > 0 && Object.values(rates).every(r => r && parseFloat(r) > 0)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Update Exchange Rates" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/exchange-rates" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Update Exchange Rates</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Set exchange rates effective from {today}</p>
          </div>
        </div>

        {/* Error Messages */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Validation Errors</h3>
                <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                  {Object.entries(errors).map(([field, msgs]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {Array.isArray(msgs) ? msgs.join(', ') : msgs}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <Form method="post" action="/exchange-rates" className="max-w-2xl space-y-6">
          {/* Exchange Rates Card */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rates (Base: INR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Rates */}
              <div className="space-y-3">
                {Object.entries(rates).map(([currency, rate]) => (
                  <div key={currency} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-sm font-medium block mb-2">
                        {currency} Rate
                      </Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="0"
                        placeholder="Enter exchange rate"
                        value={rate}
                        onChange={(e) => handleRateChange(currency, e.target.value)}
                        className="h-10"
                        name={`rates[${currency}]`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCurrency(currency)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 h-10 w-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Currency */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-sm font-medium block mb-2">
                      Add Currency
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., USD"
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                      maxLength={3}
                      className="h-10 uppercase"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCurrency()
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCurrency}
                    disabled={!newCurrency || newCurrency.length !== 3}
                    className="h-10 w-10 mt-6"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effective Date Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Effective Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  type="date"
                  name="effective_date"
                  defaultValue={today}
                  max={today}
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Tip:</strong> Rates are stored with historical accuracy. Previous rates are automatically marked as inactive when new rates are added.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Link href="/exchange-rates">
              <Button type="button" variant="outline" className="px-6">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={!isFormValid}
              className="px-6"
              variant="default"
            >
              Update Rates
            </Button>
          </div>
        </Form>
      </div>
    </AppLayout>
  )
}
