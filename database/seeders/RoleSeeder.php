<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super_admin',
                'description' => 'Full system access with all permissions. Cannot be deleted or modified.',
                'is_system' => true,
                'is_active' => true,
                'color' => '#ef4444',
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Full system access, manage users, roles, and configuration',
                'is_system' => true,
                'is_active' => true,
                'color' => '#f97316',
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Team management, reporting, and quote approval',
                'is_system' => false,
                'is_active' => true,
                'color' => '#8b5cf6',
            ],
            [
                'name' => 'Sales',
                'slug' => 'sales',
                'description' => 'Quote generation, customer management, and sales tracking',
                'is_system' => false,
                'is_active' => true,
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only access to quotes, shipments, and reports',
                'is_system' => false,
                'is_active' => true,
                'color' => '#64748b',
            ],
            [
                'name' => 'Purchaser',
                'slug' => 'purchaser',
                'description' => 'Procurement focus, rate card access, and purchase tracking',
                'is_system' => false,
                'is_active' => true,
                'color' => '#22c55e',
            ],
            [
                'name' => 'Customer',
                'slug' => 'customer',
                'description' => 'External customer access to their own quotes and orders',
                'is_system' => true,
                'is_active' => true,
                'color' => '#14b8a6',
            ],
            [
                'name' => 'Vendor',
                'slug' => 'vendor',
                'description' => 'External vendor access to manage their services',
                'is_system' => true,
                'is_active' => true,
                'color' => '#eab308',
            ],
            [
                'name' => 'Supplier',
                'slug' => 'supplier',
                'description' => 'External supplier access to manage their products',
                'is_system' => true,
                'is_active' => true,
                'color' => '#ec4899',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }

        $this->command->info('Roles seeded successfully! Total: '.Role::count());
    }
}
