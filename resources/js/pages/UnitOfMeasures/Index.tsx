import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface UnitOfMeasure {
  id: number
  name: string
  symbol: string
  category: string
  conversion_factor: number
}

const CATEGORIES = ['Weight', 'Length', 'Volume', 'Count']

export default function UnitOfMeasuresIndex() {
  const { units = { data: [] }, csrf_token } = usePage().props as any
  const { alerts, dismissAlert, success, error: showError } = useAlert()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    category: '',
    conversion_factor: 1,
  })

  const resetForm = () => {
    setFormData({ name: '', symbol: '', category: '', conversion_factor: 1 })
    setErrors({})
  }

  const handleCreate = () => {
    resetForm()
    setSelectedUnit(null)
    setIsCreateOpen(true)
  }

  const handleEdit = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit)
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
      category: unit.category,
      conversion_factor: unit.conversion_factor,
    })
    setErrors({})
    setIsEditOpen(true)
  }

  const handleDelete = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit)
    setIsDeleteOpen(true)
  }

  const submitCreate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/unit-of-measures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        }
        return
      }

      success(`Unit "${formData.name}" created successfully`)
      setIsCreateOpen(false)
      resetForm()
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to create unit', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitEdit = async () => {
    if (!selectedUnit) return
    setIsLoading(true)
    try {
      const response = await fetch(`/unit-of-measures/${selectedUnit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        }
        return
      }

      success(`Unit "${formData.name}" updated successfully`)
      setIsEditOpen(false)
      resetForm()
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to update unit', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitDelete = async () => {
    if (!selectedUnit) return
    setIsLoading(true)
    try {
      const response = await fetch(`/unit-of-measures/${selectedUnit.id}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
      })

      if (!response.ok) {
        showError('Failed to delete unit', 'An unexpected error occurred')
        return
      }

      success(`Unit "${selectedUnit.name}" deleted successfully`)
      setIsDeleteOpen(false)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to delete unit', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Unit of Measures', href: '/unit-of-measures' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Unit of Measures" />
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Unit of Measures</h1>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add UoM
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Units ({units?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Factor</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units?.data?.map((unit: UnitOfMeasure) => (
                    <tr key={unit.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{unit.name}</td>
                      <td className="py-3 px-4 font-mono">{unit.symbol}</td>
                      <td className="py-3 px-4">{unit.category}</td>
                      <td className="py-3 px-4 text-right">{unit.conversion_factor}</td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(unit)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(unit)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {units?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No units found</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Add Unit of Measure">
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-name">Name *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Kilogram"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="create-symbol">Symbol *</Label>
            <Input
              id="create-symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., kg"
              className={errors.symbol ? 'border-red-500' : ''}
            />
            {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
          </div>

          <div>
            <Label htmlFor="create-category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="create-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <Label htmlFor="create-factor">Conversion Factor *</Label>
            <Input
              id="create-factor"
              type="number"
              step="0.0001"
              value={formData.conversion_factor}
              onChange={(e) => setFormData({ ...formData, conversion_factor: parseFloat(e.target.value) || 1 })}
              className={errors.conversion_factor ? 'border-red-500' : ''}
            />
            {errors.conversion_factor && <p className="text-red-500 text-sm mt-1">{errors.conversion_factor}</p>}
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
      <BaseDialog open={isEditOpen} onOpenChange={setIsEditOpen} title="Edit Unit of Measure">
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Kilogram"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="edit-symbol">Symbol *</Label>
            <Input
              id="edit-symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., kg"
              className={errors.symbol ? 'border-red-500' : ''}
            />
            {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
          </div>

          <div>
            <Label htmlFor="edit-category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="edit-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <Label htmlFor="edit-factor">Conversion Factor *</Label>
            <Input
              id="edit-factor"
              type="number"
              step="0.0001"
              value={formData.conversion_factor}
              onChange={(e) => setFormData({ ...formData, conversion_factor: parseFloat(e.target.value) || 1 })}
              className={errors.conversion_factor ? 'border-red-500' : ''}
            />
            {errors.conversion_factor && <p className="text-red-500 text-sm mt-1">{errors.conversion_factor}</p>}
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
        title="Delete Unit"
        description={`Are you sure you want to delete unit "${selectedUnit?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={submitDelete}
        isLoading={isLoading}
        variant="destructive"
      />
    </AppLayout>
  )
}
