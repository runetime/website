<?php namespace App\Providers;

use Illuminate\Routing\Router;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider {

	/**
	 * All of the application's route middleware keys.
	 *
	 * @var array
	 */
	protected $middleware = [
		'auth' => 'App\Http\Middleware\Authenticated',
		'guest' => 'App\Http\Middleware\IsGuest',
		'staff' => 'App\Http\Middleware\Staff',
		'staff.admin' => 'App\Http\Middleware\StaffAdministrator',
		'staff.content' => 'App\Http\Middleware\StaffContent',
		'staff.moderator' => 'App\Http\Middleware\StaffModerator',
		'staff.radio' => 'App\Http\Middleware\StaffRadio',
	];

	/**
	 * Called before routes are registered.
	 *
	 * Register any model bindings or pattern based filters.
	 *
	 * @param  \Illuminate\Routing\Router  $router
	 * @return void
	 */
	public function before(Router $router)
	{
		//
	}

	/**
	 * Define the routes for the application.
	 *
	 * @param  \Illuminate\Routing\Router  $router
	 * @return void
	 */
	public function map(Router $router)
	{
		$router->group(['namespace' => 'App\Http\Controllers'], function($router)
		{
			require app_path('Http/routes.php');
		});
	}

}
