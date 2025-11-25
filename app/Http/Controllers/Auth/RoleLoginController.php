<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Services\RoleService;
use Illuminate\Routing\Controller as BaseController;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class RoleLoginController extends BaseController
{
    /**
     * Show role-specific login form
     */
    public function show(string $role)
    {
        try {
            $roleEnum = UserRole::tryFrom($role) ?? UserRole::CUSTOMER;
            $config = RoleService::getLoginConfig($roleEnum);

            return Inertia::render('auth/login', [
                'status' => session('status'),
                'canResetPassword' => Features::enabled(Features::resetPasswords()),
                'canRegister' => Features::enabled(Features::registration()),
                'roleConfig' => $config,
            ]);
        } catch (\Exception $e) {
            return redirect('/login');
        }
    }
}
