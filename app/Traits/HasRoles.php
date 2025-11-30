<?php

namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRoles
{
    /**
     * Get all roles for the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(Role|string $role): void
    {
        $role = $this->resolveRole($role);
        $this->roles()->syncWithoutDetaching($role);
    }

    /**
     * Remove a role from the user.
     */
    public function removeRole(Role|string $role): void
    {
        $role = $this->resolveRole($role);
        $this->roles()->detach($role);
    }

    /**
     * Sync roles for the user.
     *
     * @param  array<int>  $roleIds
     */
    public function syncRoles(array $roleIds): void
    {
        $this->roles()->sync($roleIds);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(Role|string|array $role): bool
    {
        if (is_array($role)) {
            return $this->roles()->whereIn('slug', $role)->exists();
        }

        $role = $this->resolveRole($role);

        return $this->roles()->where('roles.id', $role->id)->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('slug', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        $count = $this->roles()->whereIn('slug', $roles)->count();

        return $count === count($roles);
    }

    /**
     * Get the role slugs for the user.
     */
    public function getRoleSlugs(): array
    {
        return $this->roles()->pluck('slug')->toArray();
    }

    /**
     * Check if user has a specific permission through any of their roles.
     */
    public function hasPermission(Permission|string|int $permission): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        $permission = $this->resolvePermission($permission);

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('permissions.id', $permission->id);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions.
     *
     * @param  array<string|int|Permission>  $permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $slugs = collect($permissions)->map(function ($permission) {
            if ($permission instanceof Permission) {
                return $permission->slug;
            }
            if (is_int($permission)) {
                return Permission::find($permission)?->slug;
            }

            return $permission;
        })->filter()->toArray();

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($slugs) {
                $query->whereIn('slug', $slugs);
            })
            ->exists();
    }

    /**
     * Check if user has all of the given permissions.
     *
     * @param  array<string|int|Permission>  $permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($permissions as $permission) {
            if (! $this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permissions for the user through their roles.
     *
     * @return \Illuminate\Support\Collection<Permission>
     */
    public function getAllPermissions()
    {
        if ($this->isSuperAdmin()) {
            return Permission::active()->get();
        }

        return Permission::whereHas('roles', function ($query) {
            $query->whereIn('roles.id', $this->roles()->pluck('roles.id'));
        })->active()->get();
    }

    /**
     * Get all permission slugs for the user.
     *
     * @return array<string>
     */
    public function getPermissionSlugs(): array
    {
        return $this->getAllPermissions()->pluck('slug')->toArray();
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /**
     * Check if user is an admin (super_admin or admin).
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * Check if user can manage users.
     */
    public function canManageUsers(): bool
    {
        return $this->hasPermission('users.manage') || $this->isSuperAdmin();
    }

    /**
     * Check if user can manage roles.
     */
    public function canManageRoles(): bool
    {
        return $this->hasPermission('roles.manage') || $this->isSuperAdmin();
    }

    /**
     * Resolve a role string or model to a Role instance.
     */
    private function resolveRole(Role|string $role): Role
    {
        if ($role instanceof Role) {
            return $role;
        }

        return Role::where('slug', $role)->firstOrFail();
    }

    /**
     * Resolve a permission string/int to a Permission instance.
     */
    private function resolvePermission(Permission|string|int $permission): Permission
    {
        if ($permission instanceof Permission) {
            return $permission;
        }

        if (is_int($permission)) {
            return Permission::findOrFail($permission);
        }

        return Permission::where('slug', $permission)->firstOrFail();
    }
}
