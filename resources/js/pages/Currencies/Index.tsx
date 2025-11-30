import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { usePage, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, Star } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { BaseDialog } from '@/components/dialogs/base-dialog'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { useAlert } from '@/hooks/use-alert'
import { AlertContainer } from '@/components/alert-container'

interface Currency {
  id: number
  currency_code: string
  currency_name: string
  symbol: string | null
  decimal_places: number
  is_base_currency: boolean
  is_active: boolean
  description: string | null
}

interface PaginatedResponse {
  data: Currency[]
  total: number
}

export default function CurrenciesIndex() {
  const { currencies = { data: [] }, csrf_token } = usePage().props as any
  const { alerts, dismissAlert, success, error: showError } = useAlert()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currency_code: '',
    currency_name: '',
    symbol: '',
    decimal_places: '2',
    is_base_currency: false,
    is_active: true,
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Currency Master', href: '/currencies' },
  ]

  const handleCreate = () => {
    setFormData({
      currency_code: '',
      currency_name: '',
      symbol: '',
      decimal_places: '2',
      is_base_currency: false,
      is_active: true,
      description: '',
    })
    setErrors({})
    setIsCreateOpen(true)
  }

  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency)
    setFormData({
      currency_code: currency.currency_code,
      currency_name: currency.currency_name,
      symbol: currency.symbol || '',
      decimal_places: String(currency.decimal_places),
      is_base_currency: currency.is_base_currency,
      is_active: currency.is_active,
      description: currency.description || '',
    })
    setErrors({})
    setIsEditOpen(true)
  }

  const handleDelete = (currency: Currency) => {
    setSelectedCurrency(currency)
    setIsDeleteOpen(true)
  }

  const handleView = (currency: Currency) => {
    setSelectedCurrency(currency)
    setIsDetailOpen(true)
  }

  const submitCreate = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const payload = {
        ...formData,
        decimal_places: parseInt(formData.decimal_places),
      }

      const response = await fetch('/currencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors) {
          setErrors(data.errors)
        }
        return
      }

      setIsCreateOpen(false)
      success(`Currency ${formData.currency_code} created successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to create currency', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitEdit = async () => {
    if (!selectedCurrency) return

    setIsLoading(true)
    setErrors({})

    try {
      const payload = {
        ...formData,
        decimal_places: parseInt(formData.decimal_places),
      }

      const response = await fetch(`/currencies/${selectedCurrency.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors) {
          setErrors(data.errors)
        }
        return
      }

      setIsEditOpen(false)
      success(`Currency ${formData.currency_code} updated successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to update currency', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitDelete = async () => {
    if (!selectedCurrency) return

    setIsLoading(true)

    try {
      const response = await fetch(`/currencies/${selectedCurrency.id}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error) {
          showError('Cannot delete currency', data.error)
        }
        setIsDeleteOpen(false)
        return
      }

      setIsDeleteOpen(false)
      success(`Currency ${selectedCurrency.currency_code} deleted successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to delete currency', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const renderForm = (mode: 'create' | 'edit') => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${mode}-code`}>Currency Code (ISO 4217) *</Label>
          <Input
            id={`${mode}-code`}
            value={formData.currency_code}
            onChange={(e) => setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })}
            placeholder="e.g., USD, EUR, INR"
            maxLength={3}
            className={errors.currency_code ? 'border-red-500' : ''}
          />
          {errors.currency_code && <p className="text-red-500 text-sm mt-1">{errors.currency_code}</p>}
        </div>

        <div>
          <Label htmlFor={`${mode}-symbol`}>Symbol</Label>
          <Input
            id={`${mode}-symbol`}
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="e.g., $, €, ₹"
            maxLength={10}
            className={errors.symbol ? 'border-red-500' : ''}
          />
          {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor={`${mode}-name`}>Currency Name *</Label>
        <Input
          id={`${mode}-name`}
          value={formData.currency_name}
          onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
          placeholder="e.g., US Dollar, Euro, Indian Rupee"
          className={errors.currency_name ? 'border-red-500' : ''}
        />
        {errors.currency_name && <p className="text-red-500 text-sm mt-1">{errors.currency_name}</p>}
      </div>

      <div>
        <Label htmlFor={`${mode}-decimals`}>Decimal Places *</Label>
        <Input
          id={`${mode}-decimals`}
          type="number"
          min="0"
          max="6"
          value={formData.decimal_places}
          onChange={(e) => setFormData({ ...formData, decimal_places: e.target.value })}
          className={errors.decimal_places ? 'border-red-500' : ''}
        />
        {errors.decimal_places && <p className="text-red-500 text-sm mt-1">{errors.decimal_places}</p>}
      </div>

      <div>
        <Label htmlFor={`${mode}-description`}>Description</Label>
        <textarea
          id={`${mode}-description`}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add any notes about this currency"
          className="w-full p-2 border rounded-md text-sm"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${mode}-base`}
            checked={formData.is_base_currency}
            onCheckedChange={(checked) => setFormData({ ...formData, is_base_currency: checked as boolean })}
          />
          <Label htmlFor={`${mode}-base`} className="cursor-pointer">Base Currency</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id={`${mode}-active`}
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
          />
          <Label htmlFor={`${mode}-active`} className="cursor-pointer">Active</Label>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={() => mode === 'create' ? setIsCreateOpen(false) : setIsEditOpen(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={mode === 'create' ? submitCreate : submitEdit} disabled={isLoading}>
          {isLoading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create' : 'Update')}
        </Button>
      </div>
    </div>
  )

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Currency Master" />
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Currency Master</h1>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Currency
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Currencies ({currencies?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-center py-3 px-4 font-medium">Decimals</th>
                    <th className="text-center py-3 px-4 font-medium">Base</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies?.data?.map((currency: Currency) => (
                    <tr key={currency.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{currency.currency_code}</td>
                      <td className="py-3 px-4 text-lg">{currency.symbol || '-'}</td>
                      <td className="py-3 px-4 font-medium">{currency.currency_name}</td>
                      <td className="py-3 px-4 text-center">{currency.decimal_places}</td>
                      <td className="py-3 px-4 text-center">
                        {currency.is_base_currency && (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 inline" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={
                            currency.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-white'
                          }
                        >
                          {currency.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleView(currency)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(currency)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(currency)} disabled={currency.is_base_currency}>
                          <Trash2 className={`w-4 h-4 ${currency.is_base_currency ? 'text-gray-300' : 'text-red-500'}`} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {currencies?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No currencies found. Create one to get started.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Add Currency">
        {renderForm('create')}
      </BaseDialog>

      {/* Edit Modal */}
      <BaseDialog open={isEditOpen} onOpenChange={setIsEditOpen} title="Edit Currency">
        {renderForm('edit')}
      </BaseDialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Currency"
        description={`Are you sure you want to delete currency "${selectedCurrency?.currency_code} - ${selectedCurrency?.currency_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={submitDelete}
        isLoading={isLoading}
        variant="destructive"
      />

      {/* Detail Modal */}
      <BaseDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} title="Currency Details">
        {selectedCurrency && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Currency Code</Label>
                <p className="font-mono font-bold text-primary text-lg">{selectedCurrency.currency_code}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Symbol</Label>
                <p className="font-medium text-2xl">{selectedCurrency.symbol || '-'}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Currency Name</Label>
              <p className="font-medium">{selectedCurrency.currency_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Decimal Places</Label>
                <p className="font-medium">{selectedCurrency.decimal_places}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <div className="mt-1">
                  <Badge
                    className={
                      selectedCurrency.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-white'
                    }
                  >
                    {selectedCurrency.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            {selectedCurrency.is_base_currency && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-yellow-700 dark:text-yellow-400">This is the base currency</span>
              </div>
            )}

            {selectedCurrency.description && (
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedCurrency.description}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Button onClick={() => { setIsDetailOpen(false); handleEdit(selectedCurrency); }}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </BaseDialog>
    </AppLayout>
  )
}
