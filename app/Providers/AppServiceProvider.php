<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Role gates
        Gate::define('admin', fn ($user) => $user->hasRole('admin'));
        Gate::define('manager', fn ($user) => $user->hasRole('manager'));
        Gate::define('sales', fn ($user) => $user->hasRole('sales'));
        Gate::define('viewer', fn ($user) => $user->hasRole('viewer'));
        Gate::define('purchaser', fn ($user) => $user->hasRole('purchaser'));
        Gate::define('client', fn ($user) => $user->hasRole('client'));

        // Feature-specific gates
        Gate::define('manage-rates', fn ($user) => $user->hasAnyRole(['admin', 'manager', 'purchaser']));
        Gate::define('generate-quotes', fn ($user) => $user->hasAnyRole(['admin', 'manager', 'sales']));
        Gate::define('manage-customers', fn ($user) => $user->hasAnyRole(['admin', 'manager', 'sales']));
        Gate::define('view-reports', fn ($user) => $user->hasAnyRole(['admin', 'manager', 'viewer']));
        Gate::define('manage-users', fn ($user) => $user->hasRole('admin'));
        Gate::define('manage-roles', fn ($user) => $user->hasRole('admin'));
    }
}
