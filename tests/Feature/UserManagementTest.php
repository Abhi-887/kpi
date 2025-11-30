<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    // Create Super Admin role
    $this->superAdminRole = Role::firstOrCreate(
        ['slug' => 'super_admin'],
        ['name' => 'Super Admin', 'is_system' => true, 'is_active' => true, 'color' => '#ef4444']
    );

    // Create Admin role
    $this->adminRole = Role::firstOrCreate(
        ['slug' => 'admin'],
        ['name' => 'Admin', 'is_system' => true, 'is_active' => true, 'color' => '#f97316']
    );

    // Create User role
    $this->userRole = Role::firstOrCreate(
        ['slug' => 'sales'],
        ['name' => 'Sales', 'is_system' => false, 'is_active' => true, 'color' => '#3b82f6']
    );

    // Create permissions
    $this->usersManagePermission = Permission::firstOrCreate(
        ['slug' => 'users.manage'],
        ['name' => 'Manage Users', 'module' => 'users', 'is_active' => true]
    );

    $this->rolesManagePermission = Permission::firstOrCreate(
        ['slug' => 'roles.manage'],
        ['name' => 'Manage Roles', 'module' => 'roles', 'is_active' => true]
    );

    // Assign permissions to admin role
    $this->adminRole->syncPermissions([$this->usersManagePermission->id, $this->rolesManagePermission->id]);
});

describe('User Management - Authentication', function () {
    it('redirects unauthenticated users to login', function () {
        $this->get('/users')
            ->assertRedirect('/login');
    });

    it('forbids non-admin users from accessing user management', function () {
        $user = User::factory()->create();
        $user->assignRole($this->userRole);

        $this->actingAs($user)
            ->get('/users')
            ->assertForbidden();
    });

    it('allows super admin to access user management', function () {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole($this->superAdminRole);

        $this->actingAs($superAdmin)
            ->get('/users')
            ->assertOk();
    });

    it('allows admin to access user management', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $this->actingAs($admin)
            ->get('/users')
            ->assertOk();
    });
});

describe('User Management - CRUD', function () {
    it('displays users list', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        User::factory()->count(5)->create()->each(function ($user) {
            $user->assignRole($this->userRole);
        });

        $this->actingAs($admin)
            ->get('/users')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Users/Index')
                ->has('users.data', 6)
            );
    });

    it('creates a new user', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $this->actingAs($admin)
            ->post('/users', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'Password123',
                'password_confirmation' => 'Password123',
                'roles' => [$this->userRole->id],
            ])
            ->assertRedirect('/users');

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);

        $newUser = User::where('email', 'john@example.com')->first();
        expect($newUser->hasRole($this->userRole))->toBeTrue();
    });

    it('updates an existing user', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $user = User::factory()->create(['name' => 'Old Name']);
        $user->assignRole($this->userRole);

        $this->actingAs($admin)
            ->put("/users/{$user->id}", [
                'name' => 'New Name',
                'email' => $user->email,
                'roles' => [$this->userRole->id],
            ])
            ->assertRedirect("/users/{$user->id}");

        $user->refresh();
        expect($user->name)->toBe('New Name');
    });

    it('deletes a user', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $user = User::factory()->create();
        $user->assignRole($this->userRole);

        $this->actingAs($admin)
            ->delete("/users/{$user->id}")
            ->assertRedirect('/users');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    });

    it('prevents admin from deleting themselves', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $this->actingAs($admin)
            ->delete("/users/{$admin->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    });
});

describe('Role Management', function () {
    it('displays roles list', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $this->actingAs($admin)
            ->get('/roles')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Roles/Index')
                ->has('roles.data')
            );
    });

    it('creates a new role', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $this->actingAs($admin)
            ->post('/roles', [
                'name' => 'Test Role',
                'description' => 'A test role',
                'permissions' => [$this->usersManagePermission->id],
            ])
            ->assertRedirect('/roles');

        $this->assertDatabaseHas('roles', ['name' => 'Test Role']);

        $newRole = Role::where('name', 'Test Role')->first();
        expect($newRole->hasPermission($this->usersManagePermission))->toBeTrue();
    });

    it('updates a role', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $role = Role::create([
            'name' => 'Old Role',
            'slug' => 'old_role',
            'is_system' => false,
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->put("/roles/{$role->id}", [
                'name' => 'Updated Role',
                'permissions' => [],
            ])
            ->assertRedirect("/roles/{$role->id}");

        $role->refresh();
        expect($role->name)->toBe('Updated Role');
    });

    it('prevents deleting system roles', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $this->actingAs($admin)
            ->delete("/roles/{$this->adminRole->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('roles', ['id' => $this->adminRole->id]);
    });

    it('duplicates a role', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        $role = Role::create([
            'name' => 'Original Role',
            'slug' => 'original_role',
            'is_system' => false,
            'is_active' => true,
        ]);
        $role->syncPermissions([$this->usersManagePermission->id]);

        $this->actingAs($admin)
            ->post("/roles/{$role->id}/duplicate");

        $this->assertDatabaseHas('roles', ['name' => 'Original Role (Copy)']);
    });
});

describe('Permission Checks', function () {
    it('super admin has all permissions', function () {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole($this->superAdminRole);

        expect($superAdmin->isSuperAdmin())->toBeTrue();
        expect($superAdmin->hasPermission('users.manage'))->toBeTrue();
        expect($superAdmin->hasPermission('any.random.permission'))->toBeTrue();
    });

    it('admin has assigned permissions', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        expect($admin->hasPermission($this->usersManagePermission))->toBeTrue();
        expect($admin->hasPermission($this->rolesManagePermission))->toBeTrue();
    });

    it('regular user does not have admin permissions', function () {
        $user = User::factory()->create();
        $user->assignRole($this->userRole);

        expect($user->hasPermission($this->usersManagePermission))->toBeFalse();
        expect($user->hasPermission($this->rolesManagePermission))->toBeFalse();
    });

    it('can check multiple permissions with hasAnyPermission', function () {
        $admin = User::factory()->create();
        $admin->assignRole($this->adminRole);

        expect($admin->hasAnyPermission(['users.manage', 'unknown.permission']))->toBeTrue();
        expect($admin->hasAnyPermission(['unknown.permission1', 'unknown.permission2']))->toBeFalse();
    });
});
