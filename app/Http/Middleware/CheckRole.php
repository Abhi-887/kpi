<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = auth()->user();

        // Super Admin (via roles relationship) has access to everything
        if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
            return $next($request);
        }

        // Check role_slug (enum-based role system)
        if ($user->role_slug) {
            $userRoleSlug = $user->role_slug instanceof UserRole
                ? $user->role_slug->value
                : $user->role_slug;

            // Super Admin via enum also has access everywhere
            if ($userRoleSlug === UserRole::SUPER_ADMIN->value) {
                return $next($request);
            }

            if (in_array($userRoleSlug, $roles, true)) {
                return $next($request);
            }
        }

        // Check many-to-many roles relationship
        if (method_exists($user, 'hasAnyRole') && $user->hasAnyRole($roles)) {
            return $next($request);
        }

        return Inertia::render('Error', [
            'status' => 403,
            'title' => 'Access Denied',
            'message' => 'You do not have permission to access this resource.',
        ])->toResponse($request)->setStatusCode(403);
    }
}
