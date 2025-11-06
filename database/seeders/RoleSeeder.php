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
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Full system access, manage users, roles, and configuration',
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Team management, reporting, and quote approval',
            ],
            [
                'name' => 'Sales',
                'slug' => 'sales',
                'description' => 'Quote generation, customer management, and sales tracking',
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only access to quotes, shipments, and reports',
            ],
            [
                'name' => 'Purchaser',
                'slug' => 'purchaser',
                'description' => 'Procurement focus, rate card access, and purchase tracking',
            ],
            [
                'name' => 'Client',
                'slug' => 'client',
                'description' => 'External customer access to their own quotes',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}
