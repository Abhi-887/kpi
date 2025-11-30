import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link, router } from '@inertiajs/react'
import { Form } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Shield, ArrowLeft, Save } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface Permission {
  id: number
  name: string
  slug: string
  description: string | null
  module: string
  group: string | null
  is_active: boolean
  roles_count: number
}

interface EditProps {
  permission: Permission
  modules: string[]
  groups: string[]
}

export default function Edit({ permission, modules = [], groups = [] }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Permissions', href: '/permissions' },
    { title: permission.name, href: `/permissions/${permission.id}` },
    { title: 'Edit', href: `/permissions/${permission.id}/edit` },
  ]

  const [selectedModule, setSelectedModule] = useState(permission.module || '')
  const [selectedGroup, setSelectedGroup] = useState(permission.group || '')
  const [newModule, setNewModule] = useState('')
  const [newGroup, setNewGroup] = useState('')

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${permission.name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Edit Permission
            </h1>
            <p className="text-sm text-muted-foreground">Update permission details</p>
          </div>
          <Link href="/permissions">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Permissions
            </Button>
          </Link>
        </div>

        <Form
          action={`/permissions/${permission.id}`}
          method="put"
          className="space-y-6"
        >
          {({ errors, processing }) => (
            <>
              {/* Permission Details */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Permission Details
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {permission.roles_count} roles
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Permission Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={permission.name}
                        placeholder="e.g., View Users"
                        className="dark:bg-gray-900 dark:border-gray-700"
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        defaultValue={permission.slug}
                        placeholder="e.g., users.view"
                        className="dark:bg-gray-900 dark:border-gray-700"
                      />
                      {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={permission.description || ''}
                      placeholder="Brief description of what this permission allows..."
                      rows={2}
                      className="dark:bg-gray-900 dark:border-gray-700"
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Module *</Label>
                      <Select value={selectedModule} onValueChange={setSelectedModule}>
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                          <SelectValue placeholder="Select or type new module" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">+ Create New Module</SelectItem>
                          {modules.map((mod) => (
                            <SelectItem key={mod} value={mod} className="capitalize">
                              {mod.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedModule === 'new' && (
                        <Input
                          placeholder="Enter new module name"
                          value={newModule}
                          onChange={(e) => setNewModule(e.target.value)}
                          className="dark:bg-gray-900 dark:border-gray-700 mt-2"
                        />
                      )}
                      <input 
                        type="hidden" 
                        name="module" 
                        value={selectedModule === 'new' ? newModule : selectedModule} 
                      />
                      {errors.module && <p className="text-sm text-destructive">{errors.module}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Group (optional)</Label>
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                          <SelectValue placeholder="Select or type new group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Group</SelectItem>
                          <SelectItem value="new">+ Create New Group</SelectItem>
                          {groups.map((grp) => (
                            <SelectItem key={grp} value={grp} className="capitalize">
                              {grp.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedGroup === 'new' && (
                        <Input
                          placeholder="Enter new group name"
                          value={newGroup}
                          onChange={(e) => setNewGroup(e.target.value)}
                          className="dark:bg-gray-900 dark:border-gray-700 mt-2"
                        />
                      )}
                      <input 
                        type="hidden" 
                        name="group" 
                        value={selectedGroup === 'new' ? newGroup : selectedGroup} 
                      />
                      {errors.group && <p className="text-sm text-destructive">{errors.group}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="is_active" name="is_active" defaultChecked={permission.is_active} />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href="/permissions">
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
