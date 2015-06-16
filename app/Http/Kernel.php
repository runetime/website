<?php
namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * @var array
     */
    protected $middleware = [
        \Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode::class,
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\ReplaceTestVars::class,
        // \App\Http\Middleware\VerifyCsrfToken::class,
    ];

    /**
     * The application's route middleware.
     *
     * @var array
     */
    protected $routeMiddleware = [
        'auth'              => \App\Http\Middleware\Authenticate::class,
        'auth.basic'        => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'guest'             => \App\Http\Middleware\RedirectIfAuthenticated::class,

        'staff'             => \App\Http\Middleware\Staff::class,
        'staff.admin'       => \App\Http\Middleware\StaffAdministrator::class,
        'staff.content'     => \App\Http\Middleware\StaffContent::class,
        'staff.leader'      => \App\Http\Middleware\StaffLeader::class,
        'staff.moderator'   => \App\Http\Middleware\StaffModerator::class,
        'staff.radio'       => \App\Http\Middleware\StaffRadio::class,
        'staff.team_leader' => \App\Http\Middleware\StaffLeader::class,
    ];
}
