<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if ($request->user() === null) {
            return redirect('login');
        }

        // Convert string roles to UserRole enums if needed
        $allowedRoles = array_map(function ($role) {
            return UserRole::tryFrom($role) ?? UserRole::CUSTOMER;
        }, $roles);

        $userRole = $request->user()->role();

        if (! in_array($userRole, $allowedRoles, true)) {
            abort(403, 'Unauthorized role');
        }

        return $next($request);
    }
}
