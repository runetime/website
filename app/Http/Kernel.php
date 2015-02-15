<?php namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

/**
 * Class Kernel
 * @package App\Http
 */
class Kernel extends HttpKernel {

	/**
	 * The application's global HTTP middleware stack.
	 *
	 * @var array
	 */
	protected $middleware = [
		'Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode',
		'Illuminate\Cookie\Middleware\EncryptCookies',
		'Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse',
		'Illuminate\Session\Middleware\StartSession',
		'Illuminate\View\Middleware\ShareErrorsFromSession',
		'App\Http\Middleware\ReplaceTestVars',
		'Illuminate\Foundation\Http\Middleware\VerifyCsrfToken',
	];

	/**
	 * The application's route middleware.
	 *
	 * @var array
	 */
	protected $routeMiddleware = [
		'auth'              => 'App\Http\Middleware\Authenticate',
		'auth.basic'        => 'Illuminate\Auth\Middleware\AuthenticateWithBasicAuth',
		'guest'             => 'App\Http\Middleware\RedirectIfAuthenticated',
		
		'staff'             => 'App\Http\Middleware\Staff',
		'staff.admin'       => 'App\Http\Middleware\StaffAdministrator',
		'staff.content'     => 'App\Http\Middleware\StaffContent',
		'staff.leader'      => 'App\Http\Middleware\StaffLeader',
		'staff.moderator'   => 'App\Http\Middleware\StaffModerator',
		'staff.radio'       => 'App\Http\Middleware\StaffRadio',
		'staff.team_leader' => 'App\Http\Middleware\StaffLeader',
	];

}
