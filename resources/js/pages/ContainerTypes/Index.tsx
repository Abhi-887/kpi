import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

interface ContainerType {
  id: number
  container_code: string
  description: string
  is_active: boolean
}

const CONTAINER_CODES = ['20GP', '20OT', '20RF', '40GP', '40HC', '40HQ', '40RF', '45HC']

export default function ContainerTypesIndex() {
  const { containerTypes = [], csrf_token } = usePage().props as any
  const { alerts, dismissAlert, success, error: showError } = useAlert()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedContainerType, setSelectedContainerType] = useState<ContainerType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    container_code: '',
    description: '',
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Container Types', href: '/container-types' },
  ]

  const handleCreate = () => {
    setFormData({
      container_code: '',
      description: '',
      is_active: true,
    })
    setErrors({})
    setIsCreateOpen(true)
  }

  const handleEdit = (containerType: ContainerType) => {
    setSelectedContainerType(containerType)
    setFormData({
      container_code: containerType.container_code,
      description: containerType.description,
      is_active: containerType.is_active,
    })
    setErrors({})
    setIsEditOpen(true)
  }

  const handleDelete = (containerType: ContainerType) => {
    setSelectedContainerType(containerType)
    setIsDeleteOpen(true)
  }

  const submitCreate = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/container-types', {
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
          showError('Validation Failed', 'Please check the form for errors')
          return
        }
        if (data.message) {
          showError('Error', data.message)
        }
        return
      }

      setIsCreateOpen(false)
      success(`Container type ${formData.container_code} created successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to create container type', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitEdit = async () => {
    if (!selectedContainerType) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch(`/container-types/${selectedContainerType.id}`, {
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
          showError('Validation Failed', 'Please check the form for errors')
          return
        }
        if (data.message) {
          showError('Error', data.message)
        }
        return
      }

      setIsEditOpen(false)
      success(`Container type ${formData.container_code} updated successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to update container type', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitDelete = async () => {
    if (!selectedContainerType) return

    setIsLoading(true)

    try {
      const response = await fetch(`/container-types/${selectedContainerType.id}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
      })

      if (!response.ok) {
        showError('Failed to delete', 'An error occurred while deleting')
        return
      }

      setIsDeleteOpen(false)
      success(`Container type ${selectedContainerType.container_code} deleted successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to delete container type', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Container Types Master" />
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Container Types Master</h1>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Container Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Container Types ({containerTypes?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {containerTypes?.map((containerType: ContainerType) => (
                    <tr key={containerType.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{containerType.container_code}</td>
                      <td className="py-3 px-4">{containerType.description}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={
                            containerType.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-white'
                          }
                        >
                          {containerType.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(containerType)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(containerType)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {containerTypes?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No container types found. Create one to get started.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <BaseDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Add Container Type"
        description="Create a new container type for SEA freight operations"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-code">Container Code *</Label>
            <Input
              id="create-code"
              value={formData.container_code}
              onChange={(e) => setFormData({ ...formData, container_code: e.target.value.toUpperCase() })}
              placeholder="e.g., 20GP, 40HC"
              className={errors.container_code ? 'border-red-500' : ''}
              list="container-codes"
            />
            <datalist id="container-codes">
              {CONTAINER_CODES.map((code) => (
                <option key={code} value={code} />
              ))}
            </datalist>
            {errors.container_code && <p className="text-red-500 text-sm mt-1">{errors.container_code}</p>}
          </div>

          <div>
            <Label htmlFor="create-description">Description *</Label>
            <Input
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., 20ft General Purpose"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
      <BaseDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Container Type"
        description="Update the container type details"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-code">Container Code *</Label>
            <Input
              id="edit-code"
              value={formData.container_code}
              onChange={(e) => setFormData({ ...formData, container_code: e.target.value.toUpperCase() })}
              placeholder="e.g., 20GP, 40HC"
              className={errors.container_code ? 'border-red-500' : ''}
              list="container-codes-edit"
            />
            <datalist id="container-codes-edit">
              {CONTAINER_CODES.map((code) => (
                <option key={code} value={code} />
              ))}
            </datalist>
            {errors.container_code && <p className="text-red-500 text-sm mt-1">{errors.container_code}</p>}
          </div>

          <div>
            <Label htmlFor="edit-description">Description *</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., 20ft General Purpose"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
        title="Delete Container Type"
        description={`Are you sure you want to delete container type "${selectedContainerType?.container_code}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={submitDelete}
        isLoading={isLoading}
        variant="destructive"
      />
    </AppLayout>
  )
}
