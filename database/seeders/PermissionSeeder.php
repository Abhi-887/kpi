<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            'users' => [
                'crud' => ['View Users', 'Create Users', 'Edit Users', 'Delete Users'],
                'management' => ['Impersonate Users', 'Export Users', 'Assign Roles'],
            ],
            'roles' => [
                'crud' => ['View Roles', 'Create Roles', 'Edit Roles', 'Delete Roles'],
                'management' => ['Assign Permissions', 'Duplicate Roles'],
            ],
            'permissions' => [
                'crud' => ['View Permissions', 'Create Permissions', 'Edit Permissions', 'Delete Permissions'],
            ],
            'customers' => [
                'crud' => ['View Customers', 'Create Customers', 'Edit Customers', 'Delete Customers'],
                'management' => ['Export Customers', 'Import Customers'],
            ],
            'orders' => [
                'crud' => ['View Orders', 'Create Orders', 'Edit Orders', 'Delete Orders'],
                'management' => ['Approve Orders', 'Cancel Orders', 'Export Orders'],
                'reports' => ['View Order Reports'],
            ],
            'quotations' => [
                'crud' => ['View Quotations', 'Create Quotations', 'Edit Quotations', 'Delete Quotations'],
                'management' => ['Approve Quotations', 'Reject Quotations', 'Convert to Order'],
                'reports' => ['View Quotation Reports'],
            ],
            'shipments' => [
                'crud' => ['View Shipments', 'Create Shipments', 'Edit Shipments', 'Delete Shipments'],
                'tracking' => ['Track Shipments', 'Update Tracking Status'],
                'reports' => ['View Shipment Reports'],
            ],
            'invoices' => [
                'crud' => ['View Invoices', 'Create Invoices', 'Edit Invoices', 'Delete Invoices'],
                'management' => ['Send Invoices', 'Mark Paid', 'Export Invoices'],
                'reports' => ['View Invoice Reports'],
            ],
            'inventory' => [
                'crud' => ['View Inventory', 'Create Inventory', 'Edit Inventory', 'Delete Inventory'],
                'management' => ['Adjust Stock', 'Transfer Stock'],
                'reports' => ['View Inventory Reports'],
            ],
            'products' => [
                'crud' => ['View Products', 'Create Products', 'Edit Products', 'Delete Products'],
                'pricing' => ['Manage Pricing', 'View Costs'],
            ],
            'vendors' => [
                'crud' => ['View Vendors', 'Create Vendors', 'Edit Vendors', 'Delete Vendors'],
                'management' => ['Manage Vendor Rates'],
            ],
            'suppliers' => [
                'crud' => ['View Suppliers', 'Create Suppliers', 'Edit Suppliers', 'Delete Suppliers'],
                'management' => ['Manage Supplier Contracts'],
            ],
            'reports' => [
                'access' => ['View Dashboard', 'View Analytics'],
                'export' => ['Export Reports', 'Generate PDF Reports'],
            ],
            'settings' => [
                'general' => ['View Settings', 'Edit Settings'],
                'system' => ['Manage System Config', 'View Audit Logs'],
            ],
            'notifications' => [
                'access' => ['View Notifications', 'Manage Preferences'],
                'management' => ['Send Notifications', 'Manage Templates'],
            ],
        ];

        $createdPermissions = [];

        foreach ($modules as $module => $groups) {
            foreach ($groups as $group => $permissions) {
                foreach ($permissions as $name) {
                    $slug = strtolower($module.'.'.str_replace(' ', '_', $name));

                    $permission = Permission::firstOrCreate(
                        ['slug' => $slug],
                        [
                            'name' => $name,
                            'module' => $module,
                            'group' => $group,
                            'description' => "Allows user to {$name}",
                            'is_active' => true,
                        ]
                    );

                    $createdPermissions[$module][] = $permission->id;
                }
            }
        }

        // Assign all permissions to Super Admin and Admin roles
        $superAdmin = Role::where('slug', 'super_admin')->first();
        $admin = Role::where('slug', 'admin')->first();

        if ($superAdmin) {
            $allPermissionIds = Permission::pluck('id')->toArray();
            $superAdmin->permissions()->sync($allPermissionIds);
        }

        if ($admin) {
            // Admin gets most permissions except some sensitive ones
            $adminExcludedSlugs = [
                'users.impersonate_users',
                'settings.manage_system_config',
                'settings.view_audit_logs',
            ];

            $adminPermissionIds = Permission::whereNotIn('slug', $adminExcludedSlugs)
                ->pluck('id')
                ->toArray();

            $admin->permissions()->sync($adminPermissionIds);
        }

        $this->command->info('Permissions seeded successfully!');
        $this->command->info('Total permissions created: '.Permission::count());
    }
}
