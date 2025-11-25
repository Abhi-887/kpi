<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Test users for each role
        $testUsers = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@shipmate.local',
                'password' => 'password',
                'role_slug' => UserRole::SUPER_ADMIN,
            ],
            [
                'name' => 'Admin User',
                'email' => 'admin@shipmate.local',
                'password' => 'password',
                'role_slug' => UserRole::ADMIN,
            ],
            [
                'name' => 'Customer User',
                'email' => 'customer@shipmate.local',
                'password' => 'password',
                'role_slug' => UserRole::CUSTOMER,
            ],
            [
                'name' => 'Vendor User',
                'email' => 'vendor@shipmate.local',
                'password' => 'password',
                'role_slug' => UserRole::VENDOR,
            ],
            [
                'name' => 'Supplier User',
                'email' => 'supplier@shipmate.local',
                'password' => 'password',
                'role_slug' => UserRole::SUPPLIER,
            ],
            [
                'name' => 'Purchase Manager',
                'email' => 'purchase@shipmate.local',
                'password' => 'password',
                'role_slug' => UserRole::PURCHASE,
            ],
        ];

        foreach ($testUsers as $userData) {
            $exists = User::where('email', $userData['email'])->exists();

            if (! $exists) {
                User::create([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => bcrypt($userData['password']),
                    'role_slug' => $userData['role_slug'],
                    'email_verified_at' => now(),
                ]);

                $this->command->info("Created {$userData['role_slug']->label()} user: {$userData['email']}");
            } else {
                $this->command->info("User already exists: {$userData['email']}");
            }
        }

        $this->command->newLine();
        $this->command->info('All role users seeded successfully!');
        $this->command->info('Test Credentials:');
        $this->command->info('Password: password (for all users)');
        $this->command->newLine();
        $this->command->table(
            ['Role', 'Email'],
            array_map(fn ($user) => [$user['role_slug']->label(), $user['email']], $testUsers)
        );
    }
}
