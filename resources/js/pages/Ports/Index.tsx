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
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { BaseDialog } from '@/components/dialogs/base-dialog'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { useAlert } from '@/hooks/use-alert'
import { AlertContainer } from '@/components/alert-container'

interface Port {
  id: number
  port_code: string
  port_name: string
  city: string
  country: string
  port_type: string
}

interface PaginatedResponse {
  data: Port[]
  total: number
}

const PORT_TYPES = ['AIR', 'SEA']

export default function PortsIndex() {
  const { ports = { data: [] }, csrf_token } = usePage().props as any
  const { alerts, dismissAlert, success, error: showError } = useAlert()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [selectedPort, setSelectedPort] = useState<Port | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [formData, setFormData] = useState({
    port_code: '',
    port_name: '',
    city: '',
    country: '',
    port_type: 'AIR',
  })
  const [bulkData, setBulkData] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ports', href: '/ports' },
  ]

  const handleCreate = () => {
    setFormData({
      port_code: '',
      port_name: '',
      city: '',
      country: '',
      port_type: 'AIR',
    })
    setErrors({})
    setIsCreateOpen(true)
  }

  const handleEdit = (port: Port) => {
    setSelectedPort(port)
    setFormData({
      port_code: port.port_code,
      port_name: port.port_name,
      city: port.city,
      country: port.country,
      port_type: port.port_type,
    })
    setErrors({})
    setIsEditOpen(true)
  }

  const handleDelete = (port: Port) => {
    setSelectedPort(port)
    setIsDeleteOpen(true)
  }

  const submitCreate = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/ports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors) {
          setErrors(data.errors)
        }
        return
      }

      setIsCreateOpen(false)
      success(`Port ${formData.port_code} created successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to create port', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitEdit = async () => {
    if (!selectedPort) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch(`/ports/${selectedPort.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors) {
          setErrors(data.errors)
        }
        return
      }

      setIsEditOpen(false)
      success(`Port ${formData.port_code} updated successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to update port', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitDelete = async () => {
    if (!selectedPort) return

    setIsLoading(true)

    try {
      const response = await fetch(`/ports/${selectedPort.id}`, {
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
      success(`Port ${selectedPort.port_code} deleted successfully`)
      router.reload()
    } catch (error) {
      console.error('Error:', error)
      showError('Failed to delete port', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const submitBulkImport = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const lines = bulkData.trim().split('\n').filter((line) => line.trim())
      const portsToImport = lines.map((line) => {
        const [port_code, port_name, city, country, port_type] = line.split('|').map((s) => s.trim())
        return {
          port_code,
          port_name,
          city,
          country,
          port_type: port_type || 'AIR',
        }
      })

      const response = await fetch('/ports/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf_token,
        },
        body: JSON.stringify({ ports: portsToImport }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        }
        return
      }

      setImportResult(data)
      if (data.imported > 0) {
        success(`Imported ${data.imported} ports successfully`, data.skipped > 0 ? `${data.skipped} ports skipped` : undefined)
      }
      setTimeout(() => {
        setIsBulkImportOpen(false)
        setImportResult(null)
        setBulkData('')
        router.reload()
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      showError('Bulk import failed', 'Please check your data format')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Ports Master" />
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Ports Master</h1>
          <div className="flex gap-2">
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Port
            </Button>
            <Button onClick={() => setIsBulkImportOpen(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ports ({ports?.data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">City</th>
                    <th className="text-left py-3 px-4 font-medium">Country</th>
                    <th className="text-center py-3 px-4 font-medium">Type</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ports?.data?.map((port: Port) => (
                    <tr key={port.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{port.port_code}</td>
                      <td className="py-3 px-4 font-medium">{port.port_name}</td>
                      <td className="py-3 px-4">{port.city}</td>
                      <td className="py-3 px-4">{port.country}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={
                            port.port_type === 'AIR'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-white'
                              : 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                          }
                        >
                          {port.port_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(port)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(port)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ports?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No ports found. Use Bulk Import to load ports.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Add Port">
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-code">Port Code *</Label>
            <Input
              id="create-code"
              value={formData.port_code}
              onChange={(e) => setFormData({ ...formData, port_code: e.target.value.toUpperCase() })}
              placeholder="e.g., DEL, SZX, INMAA"
              className={errors.port_code ? 'border-red-500' : ''}
            />
            {errors.port_code && <p className="text-red-500 text-sm mt-1">{errors.port_code}</p>}
          </div>

          <div>
            <Label htmlFor="create-name">Port Name *</Label>
            <Input
              id="create-name"
              value={formData.port_name}
              onChange={(e) => setFormData({ ...formData, port_name: e.target.value })}
              placeholder="e.g., Indira Gandhi International Airport"
              className={errors.port_name ? 'border-red-500' : ''}
            />
            {errors.port_name && <p className="text-red-500 text-sm mt-1">{errors.port_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-city">City *</Label>
              <Input
                id="create-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., New Delhi"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <Label htmlFor="create-country">Country *</Label>
              <Input
                id="create-country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., India"
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="create-type">Port Type *</Label>
            <Select
              value={formData.port_type}
              onValueChange={(value) => setFormData({ ...formData, port_type: value })}
            >
              <SelectTrigger id="create-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.port_type && <p className="text-red-500 text-sm mt-1">{errors.port_type}</p>}
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
      <BaseDialog open={isEditOpen} onOpenChange={setIsEditOpen} title="Edit Port">
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-code">Port Code *</Label>
            <Input
              id="edit-code"
              value={formData.port_code}
              onChange={(e) => setFormData({ ...formData, port_code: e.target.value.toUpperCase() })}
              placeholder="e.g., DEL, SZX, INMAA"
              className={errors.port_code ? 'border-red-500' : ''}
            />
            {errors.port_code && <p className="text-red-500 text-sm mt-1">{errors.port_code}</p>}
          </div>

          <div>
            <Label htmlFor="edit-name">Port Name *</Label>
            <Input
              id="edit-name"
              value={formData.port_name}
              onChange={(e) => setFormData({ ...formData, port_name: e.target.value })}
              placeholder="e.g., Indira Gandhi International Airport"
              className={errors.port_name ? 'border-red-500' : ''}
            />
            {errors.port_name && <p className="text-red-500 text-sm mt-1">{errors.port_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-city">City *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., New Delhi"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <Label htmlFor="edit-country">Country *</Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., India"
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="edit-type">Port Type *</Label>
            <Select
              value={formData.port_type}
              onValueChange={(value) => setFormData({ ...formData, port_type: value })}
            >
              <SelectTrigger id="edit-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.port_type && <p className="text-red-500 text-sm mt-1">{errors.port_type}</p>}
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

      {/* Bulk Import Modal */}
      <BaseDialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen} title="Bulk Import Ports">
        <div className="space-y-4">
          {importResult ? (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✓ Imported: {importResult.imported} ports
                </p>
                {importResult.skipped > 0 && (
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠ Skipped: {importResult.skipped} ports
                  </p>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800 max-h-40 overflow-y-auto">
                  {importResult.errors.map((error, idx) => (
                    <p key={idx} className="text-xs text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">
                  Format (pipe-delimited):
                  <br />
                  DEL|Indira Gandhi International Airport|New Delhi|India|AIR
                  <br />
                  SZX|Shenzhen Bao'an International Airport|Shenzhen|China|AIR
                  <br />
                  INMAA|Port of Mumbai|Mumbai|India|SEA
                </p>
              </div>

              <div>
                <Label htmlFor="bulk-data">Paste Port Data</Label>
                <textarea
                  id="bulk-data"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="One port per line, pipe-delimited: CODE|NAME|CITY|COUNTRY|TYPE"
                  className="w-full h-40 p-3 border rounded-md font-mono text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsBulkImportOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={submitBulkImport} disabled={isLoading || !bulkData.trim()}>
                  {isLoading ? 'Importing...' : 'Import Ports'}
                </Button>
              </div>
            </>
          )}
        </div>
      </BaseDialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Port"
        description={`Are you sure you want to delete port "${selectedPort?.port_code}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={submitDelete}
        isLoading={isLoading}
        variant="destructive"
      />
    </AppLayout>
  )
}
