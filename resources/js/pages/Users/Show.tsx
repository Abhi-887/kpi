import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Users, ArrowLeft, Edit2, Shield, Clock, Calendar, Mail, Check, X, Activity } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Role {
  id: number
  name: string
  slug: string
  color: string
  is_system: boolean
  permissions_count: number
}

interface Permission {
  id: number
  name: string
  slug: string
  module: string
  group: string | null
}

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  is_active: boolean
  two_factor_confirmed_at: string | null
  created_at: string
  updated_at: string
  last_login_at: string | null
  roles: Role[]
  all_permissions: Permission[]
}

interface GroupedPermissions {
  [module: string]: {
    [group: string]: Permission[]
  }
}

interface ShowProps {
  user: User
}

export default function Show({ user }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Users', href: '/users' },
    { title: user.name, href: `/users/${user.id}` },
  ]

  // Group permissions by module and group
  const groupedPermissions: GroupedPermissions = {}
  user.all_permissions?.forEach((permission) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isSuperAdmin = user.roles?.some((r) => r.slug === 'super_admin')

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={user.name} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {user.name}
                  {user.is_active ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                      Inactive
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/users">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href={`/users/${user.id}/edit`}>
              <Button className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit User
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.roles?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Roles Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isSuperAdmin ? '∞' : user.all_permissions?.length || 0}</p>
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
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.last_login_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Status Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg">
                <div className={`p-2 rounded-full ${user.email_verified_at ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <Mail className={`h-5 w-5 ${user.email_verified_at ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                </div>
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email_verified_at ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                {user.email_verified_at ? (
                  <Check className="h-5 w-5 text-green-600 ml-auto" />
                ) : (
                  <X className="h-5 w-5 text-amber-600 ml-auto" />
                )}
              </div>

              <div className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg">
                <div className={`p-2 rounded-full ${user.two_factor_confirmed_at ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Shield className={`h-5 w-5 ${user.two_factor_confirmed_at ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium">Two-Factor Auth</p>
                  <p className="text-sm text-muted-foreground">
                    {user.two_factor_confirmed_at ? 'Enabled' : 'Not Enabled'}
                  </p>
                </div>
                {user.two_factor_confirmed_at ? (
                  <Check className="h-5 w-5 text-green-600 ml-auto" />
                ) : (
                  <X className="h-5 w-5 text-gray-400 ml-auto" />
                )}
              </div>

              <div className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg">
                <div className={`p-2 rounded-full ${user.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <Activity className={`h-5 w-5 ${user.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                {user.is_active ? (
                  <Check className="h-5 w-5 text-green-600 ml-auto" />
                ) : (
                  <X className="h-5 w-5 text-red-600 ml-auto" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assigned Roles ({user.roles?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!user.roles || user.roles.length === 0) ? (
              <p className="text-center py-8 text-muted-foreground">
                No roles assigned to this user.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.roles.map((role) => (
                  <Link 
                    key={role.id} 
                    href={`/roles/${role.id}`}
                    className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: role.color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{role.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {role.permissions_count} permissions
                      </p>
                    </div>
                    {role.is_system && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        System
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Effective Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSuperAdmin ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-amber-600">Super Admin</p>
                <p className="text-muted-foreground">
                  This user has the Super Admin role and has full access to all permissions.
                </p>
              </div>
            ) : Object.keys(groupedPermissions).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No permissions available for this user.
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

        {/* Activity Timeline - Placeholder */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Activity tracking coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
