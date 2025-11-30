import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Shield, ArrowLeft, Edit2, Clock, Calendar, Layers } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Role {
  id: number
  name: string
  color: string
  is_system: boolean
}

interface Permission {
  id: number
  name: string
  slug: string
  description: string | null
  module: string
  group: string | null
  is_active: boolean
  roles_count: number
  roles: Role[]
  created_at: string
  updated_at: string
}

interface ShowProps {
  permission: Permission
}

export default function Show({ permission }: ShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Permissions', href: '/permissions' },
    { title: permission.name, href: `/permissions/${permission.id}` },
  ]

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
      <Head title={permission.name} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {permission.name}
                  {permission.is_active ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                      Inactive
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {permission.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/permissions">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href={`/permissions/${permission.id}/edit`}>
              <Button className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Permission
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
                  <p className="text-2xl font-bold">{permission.roles_count}</p>
                  <p className="text-sm text-muted-foreground">Roles Using</p>
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
                  <p className="text-sm font-medium">Module</p>
                  <p className="text-sm text-muted-foreground capitalize">{permission.module.replace('_', ' ')}</p>
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
                  <p className="text-sm text-muted-foreground">{formatDate(permission.created_at)}</p>
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
                  <p className="text-sm text-muted-foreground">{formatDate(permission.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permission Details Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permission Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-mono text-sm bg-muted dark:bg-gray-800 px-2 py-1 rounded">{permission.slug}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Group</p>
                <p className="font-mono text-sm bg-muted dark:bg-gray-800 px-2 py-1 rounded capitalize">
                  {permission.group?.replace('_', ' ') || 'No group'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles with this Permission ({permission.roles_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!permission.roles || permission.roles.length === 0) ? (
              <p className="text-center py-8 text-muted-foreground">
                No roles have this permission assigned.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {permission.roles.map((role) => (
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
      </div>
    </AppLayout>
  )
}
