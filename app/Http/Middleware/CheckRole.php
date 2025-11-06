<?php

namespace App\Http\Middleware;

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

        if (auth()->user()->hasAnyRole($roles)) {
            return $next($request);
        }

        return Inertia::render('Error', [
            'status' => 403,
            'title' => 'Access Denied',
            'message' => 'You do not have permission to access this resource.',
        ])->toResponse($request)->setStatusCode(403);
    }
}
