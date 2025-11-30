import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Users, ArrowLeft, Save, Shield, AlertTriangle } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'
import { FormEventHandler } from 'react'

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  is_system: boolean
  is_active: boolean
}

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  is_active: boolean
  roles: Role[]
  created_at: string
}

interface EditProps {
  user: User
  userRoles: number[]
  roles: Role[]
  auth?: {
    user: {
      id: number
    }
  }
}

export default function Edit({ user, userRoles = [], roles = [], auth }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Users', href: '/users' },
    { title: user.name, href: `/users/${user.id}` },
    { title: 'Edit', href: `/users/${user.id}/edit` },
  ]

  const isCurrentUser = user.id === auth?.user?.id
  const isSuperAdmin = userRoles.some((roleId) => {
    const role = roles.find((r) => r.id === roleId)
    return role?.slug === 'super_admin'
  })

  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    roles: userRoles,
    is_active: user.is_active ?? true,
  })

  const toggleRole = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId)

    // Prevent removing Super Admin role from self
    if (isCurrentUser && role?.slug === 'super_admin' && data.roles.includes(roleId)) {
      alert('You cannot remove the Super Admin role from your own account.')
      return
    }

    const newRoles = data.roles.includes(roleId)
      ? data.roles.filter((id) => id !== roleId)
      : [...data.roles, roleId]
    setData('roles', newRoles)
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    put(`/users/${user.id}`)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${user.name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Edit {user.name}
            </h1>
            <p className="text-sm text-muted-foreground">Update user details and roles</p>
          </div>
          <Link href="/users">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>

        {/* Editing Self Warning */}
        {isCurrentUser && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5" />
                <span>
                  <strong>You are editing your own account.</strong> Some restrictions apply to prevent accidental lockout.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Details */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Details
                </div>
                <div className="flex gap-2">
                  {user.email_verified_at ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      Unverified
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., John Doe"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="e.g., john@example.com"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to keep the current password</p>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm New Password</Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    placeholder="Repeat the new password"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                    disabled={isCurrentUser}
                  />
                  <Label htmlFor="is_active">Active</Label>
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(Cannot deactivate your own account)</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Assigned Roles
                </div>
                <span className="text-sm font-normal text-muted-foreground">
                  {data.roles.length} selected
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No roles available. Please create roles first.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {roles.map((role) => {
                    const isDisabled = isCurrentUser && role.slug === 'super_admin' && data.roles.includes(role.id)
                    return (
                      <label
                        key={role.id}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          data.roles.includes(role.id)
                            ? 'border-primary bg-primary/5'
                            : 'dark:border-gray-700'
                        } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <Checkbox
                          checked={data.roles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          disabled={isDisabled}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: role.color }}
                            />
                            <span className="font-medium">{role.name}</span>
                            {role.is_system && (
                              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
                                System
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              {errors.roles && <p className="text-sm text-destructive mt-2">{errors.roles}</p>}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/users">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={processing} className="gap-2">
              <Save className="h-4 w-4" />
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
