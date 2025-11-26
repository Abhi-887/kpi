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
        
        // Check role_slug (enum-based role system)
        if ($user->role_slug) {
            $userRoleSlug = $user->role_slug instanceof UserRole 
                ? $user->role_slug->value 
                : $user->role_slug;
            
            if (in_array($userRoleSlug, $roles, true)) {
                return $next($request);
            }
        }

        // Fallback: Check many-to-many roles relationship
        if ($user->hasAnyRole($roles)) {
            return $next($request);
        }

        return Inertia::render('Error', [
            'status' => 403,
            'title' => 'Access Denied',
            'message' => 'You do not have permission to access this resource.',
        ])->toResponse($request)->setStatusCode(403);
    }
}
