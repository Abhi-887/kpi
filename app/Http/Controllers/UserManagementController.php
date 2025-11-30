<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $query = User::query()
            ->with('roles:id,name,slug,color')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('slug', $request->input('role'));
            });
        }

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roles' => Role::active()->get(['id', 'name', 'slug', 'color', 'is_system', 'is_active']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::active()->get(['id', 'name', 'slug', 'color', 'description', 'is_system', 'is_active']),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->syncRoles($validated['roles']);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load(['roles.permissions', 'notificationPreferences']);

        return Inertia::render('Users/Show', [
            'user' => $user,
            'permissions' => $user->getAllPermissions()->groupBy('module'),
            'roleNames' => $user->roles->pluck('name')->toArray(),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $user->load('roles:id,name,slug');

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'userRoles' => $user->roles->pluck('id')->toArray(),
            'roles' => Role::active()->get(['id', 'name', 'slug', 'color', 'description', 'is_system', 'is_active']),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        // Check if trying to remove super_admin from the last super admin
        if ($user->isSuperAdmin()) {
            $superAdminRole = Role::where('slug', 'super_admin')->first();
            if ($superAdminRole && ! in_array($superAdminRole->id, $validated['roles'])) {
                $superAdminCount = User::whereHas('roles', function ($q) {
                    $q->where('slug', 'super_admin');
                })->count();

                if ($superAdminCount <= 1) {
                    return redirect()->back()
                        ->with('error', 'Cannot remove Super Admin role from the last Super Admin user.');
                }
            }
        }

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);
        $user->syncRoles($validated['roles']);

        return redirect()->route('users.show', $user)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return redirect()->back()
                ->with('error', 'You cannot delete your own account.');
        }

        // Prevent deleting the last super admin
        if ($user->isSuperAdmin()) {
            $superAdminCount = User::whereHas('roles', function ($q) {
                $q->where('slug', 'super_admin');
            })->count();

            if ($superAdminCount <= 1) {
                return redirect()->back()
                    ->with('error', 'Cannot delete the last Super Admin user.');
            }
        }

        $user->roles()->detach();
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Impersonate a user (Super Admin only).
     */
    public function impersonate(User $user): RedirectResponse
    {
        if (! auth()->user()->isSuperAdmin()) {
            return redirect()->back()
                ->with('error', 'Only Super Admin can impersonate users.');
        }

        if ($user->isSuperAdmin()) {
            return redirect()->back()
                ->with('error', 'Cannot impersonate a Super Admin.');
        }

        session()->put('impersonator_id', auth()->id());
        auth()->login($user);

        return redirect()->route('dashboard')
            ->with('info', "You are now impersonating {$user->name}.");
    }

    /**
     * Stop impersonating and return to original user.
     */
    public function stopImpersonating(): RedirectResponse
    {
        $impersonatorId = session()->get('impersonator_id');

        if (! $impersonatorId) {
            return redirect()->back()
                ->with('error', 'You are not impersonating anyone.');
        }

        $originalUser = User::find($impersonatorId);

        if (! $originalUser) {
            session()->forget('impersonator_id');

            return redirect()->route('login')
                ->with('error', 'Original user not found.');
        }

        session()->forget('impersonator_id');
        auth()->login($originalUser);

        return redirect()->route('dashboard')
            ->with('success', 'You have stopped impersonating.');
    }

    /**
     * Bulk assign role to users.
     */
    public function bulkAssignRole(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
            'role_id' => 'required|integer|exists:roles,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);

        foreach ($validated['user_ids'] as $userId) {
            $user = User::find($userId);
            if ($user) {
                $user->assignRole($role);
            }
        }

        return redirect()->back()
            ->with('success', 'Role assigned to selected users.');
    }

    /**
     * Export users list.
     */
    public function export(Request $request)
    {
        $query = User::query()
            ->with('roles:id,name,slug');

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('slug', $request->input('role'));
            });
        }

        $users = $query->get();

        $filename = 'users_'.date('Y-m-d_His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($users) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['ID', 'Name', 'Email', 'Roles', 'Created At']);

            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->roles->pluck('name')->implode(', '),
                    $user->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
