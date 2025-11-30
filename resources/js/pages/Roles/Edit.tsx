import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Link, router } from '@inertiajs/react'
import { Form } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Shield, ArrowLeft, Save, ChevronDown, ChevronRight, AlertTriangle, Users } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface Permission {
  id: number
  name: string
  slug: string
  description: string | null
  module: string
  group: string | null
}

interface GroupedPermissions {
  [module: string]: {
    [group: string]: Permission[]
  }
}

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  color: string
  users_count: number
  permissions: Permission[]
}

interface EditProps {
  role: Role
  permissions: GroupedPermissions
}

const colorOptions = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#f97316', label: 'Orange' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#64748b', label: 'Slate' },
]

export default function Edit({ role, permissions = {} }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Roles', href: '/roles' },
    { title: role.name, href: `/roles/${role.id}` },
    { title: 'Edit', href: `/roles/${role.id}/edit` },
  ]

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    role.permissions?.map((p) => p.id) || []
  )
  const [expandedModules, setExpandedModules] = useState<string[]>(Object.keys(permissions))
  const [selectedColor, setSelectedColor] = useState(role.color || '#6366f1')

  const toggleModule = (module: string) => {
    setExpandedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    )
  }

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    )
  }

  const selectAllInModule = (module: string) => {
    const modulePermissionIds: number[] = []
    Object.values(permissions[module] || {}).forEach((perms) => {
      perms.forEach((perm) => modulePermissionIds.push(perm.id))
    })
    
    const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id))
    
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !modulePermissionIds.includes(id)))
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...modulePermissionIds])])
    }
  }

  const selectAllInGroup = (module: string, group: string) => {
    const groupPermissionIds = permissions[module]?.[group]?.map((p) => p.id) || []
    const allSelected = groupPermissionIds.every((id) => selectedPermissions.includes(id))
    
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !groupPermissionIds.includes(id)))
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...groupPermissionIds])])
    }
  }

  const isModuleFullySelected = (module: string) => {
    const modulePermissionIds: number[] = []
    Object.values(permissions[module] || {}).forEach((perms) => {
      perms.forEach((perm) => modulePermissionIds.push(perm.id))
    })
    return modulePermissionIds.length > 0 && modulePermissionIds.every((id) => selectedPermissions.includes(id))
  }

  const isGroupFullySelected = (module: string, group: string) => {
    const groupPermissionIds = permissions[module]?.[group]?.map((p) => p.id) || []
    return groupPermissionIds.length > 0 && groupPermissionIds.every((id) => selectedPermissions.includes(id))
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${role.name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: role.color }}
              />
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Edit {role.name}
              </h1>
              {role.is_system && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  System Role
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Update role details and permissions</p>
          </div>
          <Link href="/roles">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </Button>
          </Link>
        </div>

        {/* System Role Warning */}
        {role.is_system && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5" />
                <span>
                  <strong>System Role:</strong> Be careful when editing system roles. Some modifications may affect core functionality.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Form
          action={`/roles/${role.id}`}
          method="put"
          className="space-y-6"
        >
          {({ errors, processing }) => (
            <>
              {/* Role Details */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Role Details
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {role.users_count} users
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Role Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={role.name}
                        placeholder="e.g., Sales Manager"
                        className="dark:bg-gray-900 dark:border-gray-700"
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        defaultValue={role.slug}
                        placeholder="e.g., sales_manager"
                        className="dark:bg-gray-900 dark:border-gray-700"
                        readOnly={role.is_system}
                        disabled={role.is_system}
                      />
                      {role.is_system && (
                        <p className="text-xs text-muted-foreground">System role slug cannot be changed</p>
                      )}
                      {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={role.description || ''}
                      placeholder="Brief description of this role's purpose..."
                      rows={3}
                      className="dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Role Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                            selectedColor === color.value
                              ? 'border-gray-900 dark:border-white scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                    <input type="hidden" name="color" value={selectedColor} />
                    {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="is_active" 
                      name="is_active" 
                      defaultChecked={role.is_active}
                      disabled={role.is_system && role.slug === 'super_admin'}
                    />
                    <Label htmlFor="is_active">Active</Label>
                    {role.is_system && role.slug === 'super_admin' && (
                      <span className="text-xs text-muted-foreground">(Super Admin cannot be deactivated)</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Permissions
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                      {selectedPermissions.length} selected
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(permissions).length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No permissions available. Please create permissions first.
                    </p>
                  ) : (
                    Object.entries(permissions).map(([module, groups]) => (
                      <div key={module} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between p-4 bg-muted/50 dark:bg-gray-800/50 cursor-pointer"
                          onClick={() => toggleModule(module)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules.includes(module) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-semibold capitalize">{module.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                selectAllInModule(module)
                              }}
                            >
                              {isModuleFullySelected(module) ? 'Deselect All' : 'Select All'}
                            </Button>
                          </div>
                        </div>

                        {expandedModules.includes(module) && (
                          <div className="p-4 space-y-4">
                            {Object.entries(groups).map(([group, perms]) => (
                              <div key={group} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-muted-foreground capitalize">
                                    {group.replace('_', ' ')}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => selectAllInGroup(module, group)}
                                  >
                                    {isGroupFullySelected(module, group) ? 'Deselect' : 'Select'} All
                                  </Button>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                  {perms.map((permission) => (
                                    <label
                                      key={permission.id}
                                      className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-lg hover:bg-muted/50 cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={selectedPermissions.includes(permission.id)}
                                        onCheckedChange={() => togglePermission(permission.id)}
                                      />
                                      <span className="text-sm">{permission.name}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Hidden inputs for selected permissions */}
                  {selectedPermissions.map((id) => (
                    <input key={id} type="hidden" name="permissions[]" value={id} />
                  ))}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href="/roles">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={processing} className="gap-2">
                  <Save className="h-4 w-4" />
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppLayout>
  )
}
