import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Plus, Search, Eye, Edit2, Trash2, Users, Shield, Copy, ToggleLeft, ToggleRight } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  color: string
  users_count: number
  permissions_count: number
  created_at: string
}

interface IndexProps {
  roles?: {
    data: Role[]
    links: any
    meta: any
  }
  filters?: {
    search?: string
    status?: string
  }
}

export default function Index({ roles = { data: [], links: [], meta: { total: 0, last_page: 1 } }, filters = {} }: IndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Roles', href: '/roles' },
  ]

  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')

  const handleSearch = () => {
    router.get('/roles', { 
      search, 
      status: status === 'all' ? '' : status 
    })
  }

  const handleDelete = (role: Role) => {
    if (role.is_system) {
      alert('System roles cannot be deleted.')
      return
    }
    if (role.users_count > 0) {
      alert('Cannot delete a role that is assigned to users. Please reassign users first.')
      return
    }
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      router.delete(`/roles/${role.id}`)
    }
  }

  const handleToggleStatus = (role: Role) => {
    if (role.is_system && role.slug === 'super_admin') {
      alert('Super Admin role cannot be deactivated.')
      return
    }
    router.patch(`/roles/${role.id}/toggle-status`)
  }

  const handleDuplicate = (role: Role) => {
    router.post(`/roles/${role.id}/duplicate`)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles Management" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Roles Management
            </h1>
            <p className="text-sm text-muted-foreground">Manage roles and their permissions</p>
          </div>
          <Link href="/roles/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Role
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
                  <p className="text-2xl font-bold">{roles.meta?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Roles</p>
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
                  <p className="text-2xl font-bold">{roles.data.filter(r => r.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roles.data.filter(r => r.is_system).length}</p>
                  <p className="text-sm text-muted-foreground">System Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roles.data.reduce((acc, r) => acc + r.users_count, 0)}</p>
                  <p className="text-sm text-muted-foreground">Users Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="bg-muted/50 dark:bg-gray-900/50 border-muted dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name, slug or description..."
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

        {/* Roles Table */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="dark:border-gray-800">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles ({roles?.meta?.total ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 font-semibold">Users</th>
                    <th className="text-left py-3 px-4 font-semibold">Permissions</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    roles.data.map((role) => (
                      <tr key={role.id} className="border-b dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: role.color }}
                            />
                            <div>
                              <span className="font-medium">{role.name}</span>
                              <p className="text-xs text-muted-foreground">{role.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm max-w-xs truncate">
                          {role.description || <span className="text-muted-foreground italic">No description</span>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {role.users_count}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {role.permissions_count}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {role.is_system ? (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              System
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              Custom
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {role.is_active ? (
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
                            <Link href={`/roles/${role.id}`}>
                              <Button size="sm" variant="ghost" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/roles/${role.id}/edit`}>
                              <Button size="sm" variant="ghost" title="Edit">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicate(role)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(role)}
                              title={role.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {role.is_active ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            {!role.is_system && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(role)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(roles?.meta?.last_page ?? 1) > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {(roles?.links ?? []).map((link: any, idx: number) => (
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
