import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Plus, Search, Eye, Edit2, Trash2, Shield, ToggleLeft, ToggleRight, Layers } from 'lucide-react'
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
  created_at: string
}

interface IndexProps {
  permissions?: {
    data: Permission[]
    links: any
    meta: any
  }
  modules?: string[]
  filters?: {
    search?: string
    module?: string
    status?: string
  }
}

export default function Index({ 
  permissions = { data: [], links: [], meta: { total: 0, last_page: 1 } }, 
  modules = [],
  filters = {} 
}: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Permissions', href: '/permissions' },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [module, setModule] = useState(filters.module || '')
  const [status, setStatus] = useState(filters.status || '')

  const handleSearch = () => {
    router.get('/permissions', { 
      search, 
      module: module === 'all' ? '' : module,
      status: status === 'all' ? '' : status 
    })
  }

  const handleDelete = (permission: Permission) => {
    if (permission.roles_count > 0) {
      alert(`Cannot delete permission that is assigned to ${permission.roles_count} role(s). Remove it from roles first.`)
      return
    }
    if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      router.delete(`/permissions/${permission.id}`)
    }
  }

  const handleToggleStatus = (permission: Permission) => {
    router.patch(`/permissions/${permission.id}/toggle-status`)
  }

  // Group permissions by module for display
  const groupedByModule: { [key: string]: Permission[] } = {}
  permissions.data.forEach((perm) => {
    const mod = perm.module || 'general'
    if (!groupedByModule[mod]) {
      groupedByModule[mod] = []
    }
    groupedByModule[mod].push(perm)
  })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permissions Management" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Permissions Management
            </h1>
            <p className="text-sm text-muted-foreground">Manage system permissions</p>
          </div>
          <Link href="/permissions/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Permission
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{permissions.meta?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <ToggleRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{permissions.data.filter(p => p.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{modules.length}</p>
                  <p className="text-sm text-muted-foreground">Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <ToggleLeft className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{permissions.data.filter(p => !p.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="bg-muted/50 dark:bg-gray-900/50 border-muted dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name or slug..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                  <Button onClick={handleSearch} size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
              <Select value={module} onValueChange={setModule}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((mod) => (
                    <SelectItem key={mod} value={mod} className="capitalize">
                      {mod.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Permissions by Module */}
        {Object.keys(groupedByModule).length === 0 ? (
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                No permissions found
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByModule).map(([mod, perms]) => (
            <Card key={mod} className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="dark:border-gray-800">
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Layers className="h-5 w-5" />
                  {mod.replace('_', ' ')} ({perms.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b dark:border-gray-700">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Permission</th>
                        <th className="text-left py-3 px-4 font-semibold">Slug</th>
                        <th className="text-left py-3 px-4 font-semibold">Group</th>
                        <th className="text-left py-3 px-4 font-semibold">Roles</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perms.map((permission) => (
                        <tr key={permission.id} className="border-b dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium">{permission.name}</span>
                              {permission.description && (
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-xs bg-muted dark:bg-gray-800 px-2 py-1 rounded">
                              {permission.slug}
                            </code>
                          </td>
                          <td className="py-3 px-4 capitalize">
                            {permission.group?.replace('_', ' ') || <span className="text-muted-foreground italic">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="gap-1">
                              <Shield className="h-3 w-3" />
                              {permission.roles_count}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {permission.is_active ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Link href={`/permissions/${permission.id}`}>
                                <Button size="sm" variant="ghost" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/permissions/${permission.id}/edit`}>
                                <Button size="sm" variant="ghost" title="Edit">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleStatus(permission)}
                                title={permission.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {permission.is_active ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(permission)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Pagination */}
        {(permissions?.meta?.last_page ?? 1) > 1 && (
          <div className="flex justify-center gap-2">
            {(permissions?.links ?? []).map((link: any, idx: number) => (
              <Button
                key={idx}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
              >
                {link.label.replace('&laquo;', '<<').replace('&raquo;', '>>')}
              </Button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
