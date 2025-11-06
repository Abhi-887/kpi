<?php

namespace App\Traits;

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
     * Resolve a role string or model to a Role instance.
     */
    private function resolveRole(Role|string $role): Role
    {
        if ($role instanceof Role) {
            return $role;
        }

        return Role::where('slug', $role)->firstOrFail();
    }
}
