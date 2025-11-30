import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Users, ArrowLeft, Save, Shield } from 'lucide-react'
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

interface CreateProps {
  roles: Role[]
}

export default function Create({ roles = [] }: CreateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
    { title: 'Users', href: '/users' },
    { title: 'Create User', href: '/users/create' },
  ]

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: [] as number[],
    is_active: true,
    email_verified: false,
  })

  const toggleRole = (roleId: number) => {
    const newRoles = data.roles.includes(roleId)
      ? data.roles.filter((id) => id !== roleId)
      : [...data.roles, roleId]
    setData('roles', newRoles)
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    post('/users')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create User" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Create User
            </h1>
            <p className="text-sm text-muted-foreground">Add a new user to the system</p>
          </div>
          <Link href="/users">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Details */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Details
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
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="dark:bg-gray-900 dark:border-gray-700"
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm Password *</Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    placeholder="Repeat the password"
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
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email_verified"
                    checked={data.email_verified}
                    onCheckedChange={(checked) => setData('email_verified', checked === true)}
                  />
                  <Label htmlFor="email_verified">Mark email as verified</Label>
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
                  Assign Roles
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
                  {roles.map((role) => (
                    <label
                      key={role.id}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        data.roles.includes(role.id)
                          ? 'border-primary bg-primary/5'
                          : 'dark:border-gray-700'
                      }`}
                    >
                      <Checkbox
                        checked={data.roles.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
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
                  ))}
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
              {processing ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
