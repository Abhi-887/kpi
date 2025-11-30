<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'guard_name',
        'description',
        'is_system',
        'is_active',
        'color',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Role $role) {
            if (empty($role->slug)) {
                $role->slug = Str::slug($role->name);
            }
            if (empty($role->guard_name)) {
                $role->guard_name = 'web';
            }
        });
    }

    /**
     * Get the users that belong to this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    /**
     * Get the permissions for this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    /**
     * Sync permissions for this role.
     *
     * @param  array<int>  $permissionIds
     */
    public function syncPermissions(array $permissionIds): void
    {
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Grant a permission to this role.
     */
    public function givePermission(Permission|string|int $permission): void
    {
        $permission = $this->resolvePermission($permission);
        $this->permissions()->syncWithoutDetaching($permission);
    }

    /**
     * Revoke a permission from this role.
     */
    public function revokePermission(Permission|string|int $permission): void
    {
        $permission = $this->resolvePermission($permission);
        $this->permissions()->detach($permission);
    }

    /**
     * Check if the role has a specific permission.
     */
    public function hasPermission(Permission|string|int $permission): bool
    {
        $permission = $this->resolvePermission($permission);

        return $this->permissions()->where('permissions.id', $permission->id)->exists();
    }

    /**
     * Check if the role has any of the given permissions.
     *
     * @param  array<string|int|Permission>  $permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        $slugs = collect($permissions)->map(function ($permission) {
            if ($permission instanceof Permission) {
                return $permission->slug;
            }
            if (is_int($permission)) {
                return Permission::find($permission)?->slug;
            }

            return $permission;
        })->filter()->toArray();

        return $this->permissions()->whereIn('slug', $slugs)->exists();
    }

    /**
     * Check if the role has all of the given permissions.
     *
     * @param  array<string|int|Permission>  $permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        $slugs = collect($permissions)->map(function ($permission) {
            if ($permission instanceof Permission) {
                return $permission->slug;
            }
            if (is_int($permission)) {
                return Permission::find($permission)?->slug;
            }

            return $permission;
        })->filter()->toArray();

        $count = $this->permissions()->whereIn('slug', $slugs)->count();

        return $count === count($slugs);
    }

    /**
     * Get permissions grouped by module for this role.
     *
     * @return array<string, array<string, \Illuminate\Database\Eloquent\Collection>>
     */
    public function getPermissionsGroupedByModule(): array
    {
        $permissions = $this->permissions()->orderBy('module')->orderBy('group')->get();

        $grouped = [];
        foreach ($permissions as $permission) {
            $module = $permission->module;
            $group = $permission->group ?? 'general';

            if (! isset($grouped[$module])) {
                $grouped[$module] = [];
            }
            if (! isset($grouped[$module][$group])) {
                $grouped[$module][$group] = [];
            }
            $grouped[$module][$group][] = $permission;
        }

        return $grouped;
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

    /**
     * Scope active roles.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope non-system roles.
     */
    public function scopeNonSystem($query)
    {
        return $query->where('is_system', false);
    }

    /**
     * Scope system roles.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Check if this is the Super Admin role.
     */
    public function isSuperAdmin(): bool
    {
        return $this->slug === 'super_admin';
    }

    /**
     * Get the display color with fallback.
     */
    public function getColorAttribute(?string $value): string
    {
        return $value ?? '#6366f1';
    }
}
