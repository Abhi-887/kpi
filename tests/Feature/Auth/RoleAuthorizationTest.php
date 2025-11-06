<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Role $adminRole;
    protected Role $managerRole;
    protected Role $salesRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        $this->seed(\Database\Seeders\RoleSeeder::class);

        $this->adminRole = Role::where('slug', 'admin')->first();
        $this->managerRole = Role::where('slug', 'manager')->first();
        $this->salesRole = Role::where('slug', 'sales')->first();

        $this->user = User::factory()->create();
    }

    public function test_user_can_be_assigned_a_role(): void
    {
        $this->user->assignRole($this->adminRole);

        $this->assertTrue($this->user->hasRole('admin'));
        $this->assertTrue($this->user->roles()->count() === 1);
    }

    public function test_user_can_have_multiple_roles(): void
    {
        $this->user->assignRole($this->adminRole);
        $this->user->assignRole($this->managerRole);

        $this->assertTrue($this->user->hasRole('admin'));
        $this->assertTrue($this->user->hasRole('manager'));
        $this->assertTrue($this->user->roles()->count() === 2);
    }

    public function test_user_can_be_removed_from_role(): void
    {
        $this->user->assignRole($this->adminRole);
        $this->assertTrue($this->user->hasRole('admin'));

        $this->user->removeRole($this->adminRole);
        $this->assertFalse($this->user->hasRole('admin'));
    }

    public function test_user_has_any_role(): void
    {
        $this->user->assignRole($this->salesRole);

        $this->assertTrue($this->user->hasAnyRole(['sales', 'manager', 'admin']));
        $this->assertFalse($this->user->hasAnyRole(['manager', 'admin']));
    }

    public function test_user_has_all_roles(): void
    {
        $this->user->assignRole($this->adminRole);
        $this->user->assignRole($this->managerRole);

        $this->assertTrue($this->user->hasAllRoles(['admin', 'manager']));
        $this->assertFalse($this->user->hasAllRoles(['admin', 'manager', 'sales']));
    }

    public function test_get_role_slugs(): void
    {
        $this->user->assignRole($this->adminRole);
        $this->user->assignRole($this->salesRole);

        $slugs = $this->user->getRoleSlugs();

        $this->assertContains('admin', $slugs);
        $this->assertContains('sales', $slugs);
        $this->assertCount(2, $slugs);
    }

    public function test_admin_can_access_admin_gate(): void
    {
        $this->user->assignRole($this->adminRole);

        $this->actingAs($this->user);
        $this->assertTrue($this->user->can('admin'));
    }

    public function test_non_admin_cannot_access_admin_gate(): void
    {
        $this->user->assignRole($this->salesRole);

        $this->actingAs($this->user);
        $this->assertFalse($this->user->can('admin'));
    }

    public function test_feature_gate_manage_rates(): void
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');

        $purchaserUser = User::factory()->create();
        $purchaserUser->assignRole('purchaser');

        $viewerUser = User::factory()->create();
        $viewerUser->assignRole('viewer');

        $this->assertTrue($adminUser->can('manage-rates'));
        $this->assertTrue($purchaserUser->can('manage-rates'));
        $this->assertFalse($viewerUser->can('manage-rates'));
    }

    public function test_feature_gate_generate_quotes(): void
    {
        $salesUser = User::factory()->create();
        $salesUser->assignRole('sales');

        $viewerUser = User::factory()->create();
        $viewerUser->assignRole('viewer');

        $this->assertTrue($salesUser->can('generate-quotes'));
        $this->assertFalse($viewerUser->can('generate-quotes'));
    }

    public function test_all_roles_exist_in_database(): void
    {
        $expectedRoles = ['admin', 'manager', 'sales', 'viewer', 'purchaser', 'client'];

        foreach ($expectedRoles as $role) {
            $this->assertTrue(
                Role::where('slug', $role)->exists(),
                "Role '{$role}' does not exist in database"
            );
        }
    }
}
