<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Permission extends Model
{
    /** @use HasFactory<\Database\Factories\PermissionFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'module',
        'group',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Permission $permission) {
            if (empty($permission->slug)) {
                $permission->slug = Str::slug($permission->name);
            }
        });
    }

    /**
     * Get the roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role');
    }

    /**
     * Scope active permissions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by module.
     */
    public function scopeForModule($query, string $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope by group.
     */
    public function scopeForGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Get permissions grouped by module.
     *
     * @return array<string, array<string, \Illuminate\Database\Eloquent\Collection>>
     */
    public static function getGroupedByModule(): array
    {
        $permissions = static::active()->orderBy('module')->orderBy('group')->get();

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
     * Get all available modules.
     *
     * @return array<string>
     */
    public static function getModules(): array
    {
        return static::active()
            ->select('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module')
            ->toArray();
    }
}
