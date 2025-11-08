import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePage, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { BaseDialog } from '@/components/dialogs/base-dialog'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { useAlert } from '@/hooks/use-alert'
import { AlertContainer } from '@/components/alert-container'

interface Charge {
  id: number
  charge_id: string
  charge_code: string
  charge_name: string
  default_uom_id: number
  default_tax_id: number
  default_fixed_rate_inr: number | null
  charge_type: string
  is_active: boolean
  description: string | null
  defaultUom?: { id: number; name: string; symbol: string }
  defaultTax?: { id: number; tax_code: string; tax_name: string }
}

interface UnitOfMeasure {
  id: number
  name: string
  symbol: string
}

interface TaxCode {
  id: number
  tax_code: string
  tax_name: string
}

interface PaginatedResponse {
  data: Charge[]
  total: number
}

const CHARGE_TYPES = ['fixed', 'variable', 'weight_based']
const CHARGE_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  variable: 'Variable',
  weight_based: 'Weight-Based',
}

export default function ChargesIndex() {
  const { charges = { data: [] }, unitOfMeasures = [], taxCodes = [], csrf_token } = usePage().props as any
  const { alerts, dismissAlert, success, error: showError } = useAlert()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    charge_id: '',
    charge_code: '',
    charge_name: '',
    default_uom_id: '',
    default_tax_id: '',
    default_fixed_rate_inr: '',
    charge_type: 'fixed',
    is_active: true,
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Charges Master', href: '/charges' },
  ]

  const handleCreate = () => {
    setFormData({
      charge_id: '',
      charge_code: '',
      charge_name: '',
      default_uom_id: '',
      default_tax_id: '',
      default_fixed_rate_inr: '',
      charge_type: 'fixed',
      is_active: true,
      description: '',
    })
    setErrors({})
    setIsCreateOpen(true)
  }

  const handleEdit = (charge: Charge) => {
    setSelectedCharge(charge)
    setFormData({
      charge_id: charge.charge_id,
      charge_code: charge.charge_code,
      charge_name: charge.charge_name,
      default_uom_id: String(charge.default_uom_id),
      default_tax_id: String(charge.default_tax_id),
      default_fixed_rate_inr: charge.default_fixed_rate_inr ? String(charge.default_fixed_rate_inr) : '',
      charge_type: charge.charge_type,
      is_active: charge.is_active,
      description: charge.description || '',
    })
    setErrors({})
    setIsEditOpen(true)
  }

  const handleDelete = (charge: Charge) => {
    setSelectedCharge(charge)
    setIsDeleteOpen(true)
  }

  const submitCreate = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const payload = {
        ...formData,
        default_uom_id: parseInt(formData.default_uom_id),
        default_tax_id: parseInt(formData.default_tax_id),
        default_fixed_rate_inr: formData.default_fixed_rate_inr ? parseFloat(formData.default_fixed_rate_inr) : null,
      }

      const response = await fetch('/charges', {
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
      success(`Charge ${formData.charge_code} created successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to create charge', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitEdit = async () => {
    if (!selectedCharge) return

    setIsLoading(true)
    setErrors({})

    try {
      const payload = {
        ...formData,
        default_uom_id: parseInt(formData.default_uom_id),
        default_tax_id: parseInt(formData.default_tax_id),
        default_fixed_rate_inr: formData.default_fixed_rate_inr ? parseFloat(formData.default_fixed_rate_inr) : null,
      }

      const response = await fetch(`/charges/${selectedCharge.id}`, {
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
      success(`Charge ${formData.charge_code} updated successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to update charge', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitDelete = async () => {
    if (!selectedCharge) return

    setIsLoading(true)

    try {
      const response = await fetch(`/charges/${selectedCharge.id}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
      })

      if (!response.ok) {
        return
      }

      setIsDeleteOpen(false)
      success(`Charge ${selectedCharge.charge_code} deleted successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to delete charge', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getChargeTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'fixed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-white'
      case 'variable':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-white'
      case 'weight_based':
        return 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-white'
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Charges Master" />
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Charges Master</h1>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Charge
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Charges ({charges?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-right py-3 px-4 font-medium">Rate (INR)</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charges?.data?.map((charge: Charge) => (
                    <tr key={charge.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{charge.charge_id}</td>
                      <td className="py-3 px-4 font-mono text-sm">{charge.charge_code}</td>
                      <td className="py-3 px-4 font-medium">{charge.charge_name}</td>
                      <td className="py-3 px-4">
                        <Badge className={getChargeTypeBadgeColor(charge.charge_type)}>
                          {CHARGE_TYPE_LABELS[charge.charge_type] || charge.charge_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {charge.default_fixed_rate_inr ? `₹${charge.default_fixed_rate_inr.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={
                            charge.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-white'
                          }
                        >
                          {charge.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(charge)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(charge)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {charges?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No charges found. Create one to get started.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Add Charge">
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-id">Charge ID *</Label>
            <Input
              id="create-id"
              value={formData.charge_id}
              onChange={(e) => setFormData({ ...formData, charge_id: e.target.value.toUpperCase() })}
              placeholder="e.g., CHG-001"
              className={errors.charge_id ? 'border-red-500' : ''}
            />
            {errors.charge_id && <p className="text-red-500 text-sm mt-1">{errors.charge_id}</p>}
          </div>

          <div>
            <Label htmlFor="create-code">Charge Code *</Label>
            <Input
              id="create-code"
              value={formData.charge_code}
              onChange={(e) => setFormData({ ...formData, charge_code: e.target.value.toUpperCase() })}
              placeholder="e.g., AFA, CUSCL"
              className={errors.charge_code ? 'border-red-500' : ''}
            />
            {errors.charge_code && <p className="text-red-500 text-sm mt-1">{errors.charge_code}</p>}
          </div>

          <div>
            <Label htmlFor="create-name">Charge Name *</Label>
            <Input
              id="create-name"
              value={formData.charge_name}
              onChange={(e) => setFormData({ ...formData, charge_name: e.target.value })}
              placeholder="e.g., AIR FREIGHT ALL IN CHARGES"
              className={errors.charge_name ? 'border-red-500' : ''}
            />
            {errors.charge_name && <p className="text-red-500 text-sm mt-1">{errors.charge_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-uom">Unit of Measure *</Label>
              <Select
                value={formData.default_uom_id}
                onValueChange={(value) => setFormData({ ...formData, default_uom_id: value })}
              >
                <SelectTrigger id="create-uom">
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  {unitOfMeasures?.map((uom: UnitOfMeasure) => (
                    <SelectItem key={uom.id} value={String(uom.id)}>
                      {uom.name} ({uom.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.default_uom_id && <p className="text-red-500 text-sm mt-1">{errors.default_uom_id}</p>}
            </div>

            <div>
              <Label htmlFor="create-tax">Tax Code *</Label>
              <Select
                value={formData.default_tax_id}
                onValueChange={(value) => setFormData({ ...formData, default_tax_id: value })}
              >
                <SelectTrigger id="create-tax">
                  <SelectValue placeholder="Select Tax" />
                </SelectTrigger>
                <SelectContent>
                  {taxCodes?.map((tax: TaxCode) => (
                    <SelectItem key={tax.id} value={String(tax.id)}>
                      {tax.tax_code} - {tax.tax_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.default_tax_id && <p className="text-red-500 text-sm mt-1">{errors.default_tax_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-type">Charge Type *</Label>
              <Select
                value={formData.charge_type}
                onValueChange={(value) => setFormData({ ...formData, charge_type: value })}
              >
                <SelectTrigger id="create-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHARGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {CHARGE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.charge_type && <p className="text-red-500 text-sm mt-1">{errors.charge_type}</p>}
            </div>

            <div>
              <Label htmlFor="create-rate">Fixed Rate (INR)</Label>
              <Input
                id="create-rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.default_fixed_rate_inr}
                onChange={(e) => setFormData({ ...formData, default_fixed_rate_inr: e.target.value })}
                placeholder="e.g., 4500.00"
                className={errors.default_fixed_rate_inr ? 'border-red-500' : ''}
              />
              {errors.default_fixed_rate_inr && <p className="text-red-500 text-sm mt-1">{errors.default_fixed_rate_inr}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="create-description">Description</Label>
            <textarea
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes or details about this charge"
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={submitCreate} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </BaseDialog>

      {/* Edit Modal */}
      <BaseDialog open={isEditOpen} onOpenChange={setIsEditOpen} title="Edit Charge">
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-id">Charge ID *</Label>
            <Input
              id="edit-id"
              value={formData.charge_id}
              onChange={(e) => setFormData({ ...formData, charge_id: e.target.value.toUpperCase() })}
              placeholder="e.g., CHG-001"
              className={errors.charge_id ? 'border-red-500' : ''}
            />
            {errors.charge_id && <p className="text-red-500 text-sm mt-1">{errors.charge_id}</p>}
          </div>

          <div>
            <Label htmlFor="edit-code">Charge Code *</Label>
            <Input
              id="edit-code"
              value={formData.charge_code}
              onChange={(e) => setFormData({ ...formData, charge_code: e.target.value.toUpperCase() })}
              placeholder="e.g., AFA, CUSCL"
              className={errors.charge_code ? 'border-red-500' : ''}
            />
            {errors.charge_code && <p className="text-red-500 text-sm mt-1">{errors.charge_code}</p>}
          </div>

          <div>
            <Label htmlFor="edit-name">Charge Name *</Label>
            <Input
              id="edit-name"
              value={formData.charge_name}
              onChange={(e) => setFormData({ ...formData, charge_name: e.target.value })}
              placeholder="e.g., AIR FREIGHT ALL IN CHARGES"
              className={errors.charge_name ? 'border-red-500' : ''}
            />
            {errors.charge_name && <p className="text-red-500 text-sm mt-1">{errors.charge_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-uom">Unit of Measure *</Label>
              <Select
                value={formData.default_uom_id}
                onValueChange={(value) => setFormData({ ...formData, default_uom_id: value })}
              >
                <SelectTrigger id="edit-uom">
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  {unitOfMeasures?.map((uom: UnitOfMeasure) => (
                    <SelectItem key={uom.id} value={String(uom.id)}>
                      {uom.name} ({uom.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.default_uom_id && <p className="text-red-500 text-sm mt-1">{errors.default_uom_id}</p>}
            </div>

            <div>
              <Label htmlFor="edit-tax">Tax Code *</Label>
              <Select
                value={formData.default_tax_id}
                onValueChange={(value) => setFormData({ ...formData, default_tax_id: value })}
              >
                <SelectTrigger id="edit-tax">
                  <SelectValue placeholder="Select Tax" />
                </SelectTrigger>
                <SelectContent>
                  {taxCodes?.map((tax: TaxCode) => (
                    <SelectItem key={tax.id} value={String(tax.id)}>
                      {tax.tax_code} - {tax.tax_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.default_tax_id && <p className="text-red-500 text-sm mt-1">{errors.default_tax_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-type">Charge Type *</Label>
              <Select
                value={formData.charge_type}
                onValueChange={(value) => setFormData({ ...formData, charge_type: value })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHARGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {CHARGE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.charge_type && <p className="text-red-500 text-sm mt-1">{errors.charge_type}</p>}
            </div>

            <div>
              <Label htmlFor="edit-rate">Fixed Rate (INR)</Label>
              <Input
                id="edit-rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.default_fixed_rate_inr}
                onChange={(e) => setFormData({ ...formData, default_fixed_rate_inr: e.target.value })}
                placeholder="e.g., 4500.00"
                className={errors.default_fixed_rate_inr ? 'border-red-500' : ''}
              />
              {errors.default_fixed_rate_inr && <p className="text-red-500 text-sm mt-1">{errors.default_fixed_rate_inr}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes or details about this charge"
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </BaseDialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Charge"
        description={`Are you sure you want to delete charge "${selectedCharge?.charge_code}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={submitDelete}
        isLoading={isLoading}
        variant="destructive"
      />
    </AppLayout>
  )
}
