<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(Request $request): Response
    {
        $query = Role::query()
            ->withCount(['users', 'permissions'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $roles = $query->paginate(15)->withQueryString();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        return Inertia::render('Roles/Create', [
            'permissions' => Permission::getGroupedByModule(),
            'allPermissions' => Permission::active()->get(),
            'modules' => Permission::getModules(),
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $role = Role::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? null,
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_system' => false,
        ]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {
        $role->load(['permissions', 'users:id,name,email']);

        return Inertia::render('Roles/Show', [
            'role' => $role,
            'permissionsGrouped' => $role->getPermissionsGroupedByModule(),
            'usersCount' => $role->users()->count(),
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {
        $role->load('permissions');

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'rolePermissions' => $role->permissions->pluck('id')->toArray(),
            'permissions' => Permission::getGroupedByModule(),
            'allPermissions' => Permission::active()->get(),
            'modules' => Permission::getModules(),
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if ($role->is_system && ! $request->user()->isSuperAdmin()) {
            return redirect()->back()
                ->with('error', 'System roles can only be modified by Super Admin.');
        }

        $validated = $request->validated();

        $role->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $role->slug,
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? $role->color,
            'is_active' => $validated['is_active'] ?? $role->is_active,
        ]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('roles.show', $role)
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        if ($role->is_system) {
            return redirect()->back()
                ->with('error', 'System roles cannot be deleted.');
        }

        if ($role->users()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete a role that is assigned to users. Please reassign users first.');
        }

        $role->permissions()->detach();
        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Toggle the active status of a role.
     */
    public function toggleStatus(Role $role): RedirectResponse
    {
        if ($role->is_system && $role->isSuperAdmin()) {
            return redirect()->back()
                ->with('error', 'Super Admin role cannot be deactivated.');
        }

        $role->update(['is_active' => ! $role->is_active]);

        $status = $role->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
            ->with('success', "Role {$status} successfully.");
    }

    /**
     * Duplicate a role with its permissions.
     */
    public function duplicate(Role $role): RedirectResponse
    {
        $newRole = Role::create([
            'name' => $role->name.' (Copy)',
            'slug' => $role->slug.'-copy-'.time(),
            'description' => $role->description,
            'color' => $role->color,
            'is_active' => false,
            'is_system' => false,
        ]);

        $newRole->syncPermissions($role->permissions->pluck('id')->toArray());

        return redirect()->route('roles.edit', $newRole)
            ->with('success', 'Role duplicated successfully. Please review and update the new role.');
    }
}
