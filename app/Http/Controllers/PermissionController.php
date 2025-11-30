<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions.
     */
    public function index(Request $request): Response
    {
        $query = Permission::query()
            ->withCount('roles')
            ->orderBy('module')
            ->orderBy('group')
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('module')) {
            $query->where('module', $request->input('module'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $permissions = $query->paginate(25)->withQueryString();

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
            'filters' => $request->only(['search', 'module', 'status']),
            'modules' => Permission::getModules(),
            'groupedPermissions' => Permission::getGroupedByModule(),
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create(): Response
    {
        return Inertia::render('Permissions/Create', [
            'modules' => Permission::getModules(),
            'existingGroups' => Permission::select('group')
                ->whereNotNull('group')
                ->distinct()
                ->pluck('group')
                ->toArray(),
        ]);
    }

    /**
     * Store a newly created permission.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'slug' => 'nullable|string|max:255|unique:permissions,slug',
            'module' => 'required|string|max:100',
            'group' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        Permission::create($validated);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission): Response
    {
        $permission->load('roles:id,name,slug,color');

        return Inertia::render('Permissions/Show', [
            'permission' => $permission,
            'rolesCount' => $permission->roles()->count(),
        ]);
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission): Response
    {
        return Inertia::render('Permissions/Edit', [
            'permission' => $permission,
            'modules' => Permission::getModules(),
            'existingGroups' => Permission::select('group')
                ->whereNotNull('group')
                ->distinct()
                ->pluck('group')
                ->toArray(),
        ]);
    }

    /**
     * Update the specified permission.
     */
    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'name' => "required|string|max:255|unique:permissions,name,{$permission->id}",
            'slug' => "nullable|string|max:255|unique:permissions,slug,{$permission->id}",
            'module' => 'required|string|max:100',
            'group' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $permission->update($validated);

        return redirect()->route('permissions.show', $permission)
            ->with('success', 'Permission updated successfully.');
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(Permission $permission): RedirectResponse
    {
        if ($permission->roles()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete a permission that is assigned to roles. Please remove it from roles first.');
        }

        $permission->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }

    /**
     * Toggle the active status of a permission.
     */
    public function toggleStatus(Permission $permission): RedirectResponse
    {
        $permission->update(['is_active' => ! $permission->is_active]);

        $status = $permission->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
            ->with('success', "Permission {$status} successfully.");
    }

    /**
     * Bulk create permissions for a module.
     */
    public function bulkCreate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'module' => 'required|string|max:100',
            'group' => 'nullable|string|max:100',
            'permissions' => 'required|array|min:1',
            'permissions.*.name' => 'required|string|max:255',
            'permissions.*.description' => 'nullable|string|max:500',
        ]);

        $created = 0;
        foreach ($validated['permissions'] as $permData) {
            $slug = strtolower($validated['module']).'.'.strtolower(str_replace(' ', '_', $permData['name']));

            if (Permission::where('slug', $slug)->exists()) {
                continue;
            }

            Permission::create([
                'name' => $permData['name'],
                'slug' => $slug,
                'module' => $validated['module'],
                'group' => $validated['group'] ?? null,
                'description' => $permData['description'] ?? null,
                'is_active' => true,
            ]);
            $created++;
        }

        return redirect()->route('permissions.index')
            ->with('success', "{$created} permission(s) created successfully.");
    }
}
