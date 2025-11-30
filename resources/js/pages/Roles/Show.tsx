import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Shield, ArrowLeft, Edit2, Users, Clock, Calendar } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Permission {
  id: number
  name: string
  slug: string
  description: string | null
  module: string
  group: string | null
}

interface User {
  id: number
  name: string
  email: string
  created_at: string
}

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  color: string
  guard_name: string
  users_count: number
  permissions_count: number
  permissions: Permission[]
  users: User[]
  created_at: string
  updated_at: string
}

interface GroupedPermissions {
  [module: string]: {
    [group: string]: Permission[]
  }
}

interface ShowProps {
  role: Role
}

export default function Show({ role }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Roles', href: '/roles' },
    { title: role.name, href: `/roles/${role.id}` },
  ]

  // Group permissions by module and group
  const groupedPermissions: GroupedPermissions = {}
  role.permissions?.forEach((permission) => {
    const module = permission.module || 'general'
    const group = permission.group || 'default'
    
    if (!groupedPermissions[module]) {
      groupedPermissions[module] = {}
    }
    if (!groupedPermissions[module][group]) {
      groupedPermissions[module][group] = []
    }
    groupedPermissions[module][group].push(permission)
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={role.name} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="w-5 h-5 rounded-full" 
                style={{ backgroundColor: role.color }}
              />
              <h1 className="text-3xl font-bold">{role.name}</h1>
              {role.is_system && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  System Role
                </Badge>
              )}
              {role.is_active ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{role.description || 'No description provided'}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/roles">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href={`/roles/${role.id}/edit`}>
              <Button className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Role
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{role.users_count}</p>
                  <p className="text-sm text-muted-foreground">Users Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{role.permissions_count}</p>
                  <p className="text-sm text-muted-foreground">Permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(role.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Updated</p>
                  <p className="text-sm text-muted-foreground">{formatDate(role.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Info Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-mono text-sm bg-muted dark:bg-gray-800 px-2 py-1 rounded">{role.slug}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Guard</p>
                <p className="font-mono text-sm bg-muted dark:bg-gray-800 px-2 py-1 rounded">{role.guard_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assigned Permissions ({role.permissions_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedPermissions).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No permissions assigned to this role.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, groups]) => (
                  <div key={module} className="space-y-3">
                    <h3 className="font-semibold capitalize text-lg border-b dark:border-gray-700 pb-2">
                      {module.replace('_', ' ')}
                    </h3>
                    {Object.entries(groups).map(([group, permissions]) => (
                      <div key={group} className="space-y-2 ml-4">
                        <p className="text-sm font-medium text-muted-foreground capitalize">{group.replace('_', ' ')}</p>
                        <div className="flex flex-wrap gap-2">
                          {permissions.map((permission) => (
                            <Badge key={permission.id} variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3" />
                              {permission.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users with this Role ({role.users_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!role.users || role.users.length === 0) ? (
              <p className="text-center py-8 text-muted-foreground">
                No users are assigned to this role.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b dark:border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {role.users.slice(0, 10).map((user) => (
                      <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDate(user.created_at)}</td>
                        <td className="py-3 px-4">
                          <Link href={`/users/${user.id}`}>
                            <Button size="sm" variant="ghost">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {role.users_count > 10 && (
                  <div className="text-center py-4 text-muted-foreground">
                    And {role.users_count - 10} more users...
                    <Link href={`/users?role=${role.id}`} className="ml-2 text-primary hover:underline">
                      View all
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
