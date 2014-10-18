<?php namespace App\Providers;

use Illuminate\Routing\Router;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider {

	/**
	 * The root namespace to assume when generating URLs to actions.
	 *
	 * @var string
	 */
	protected $rootUrlNamespace = 'App\Http\Controllers';

	/**
	 * The controllers to scan for route annotations.
	 *
	 * @var array
	 */
	protected $scan = [
		'App\Http\Controllers\AboutController',
		'App\Http\Controllers\AuthController',
		'App\Http\Controllers\AwardController',
		'App\Http\Controllers\BaseController',
		'App\Http\Controllers\CalculatorController',
		'App\Http\Controllers\CalendarController',
		'App\Http\Controllers\ChatController',
		'App\Http\Controllers\ClanController',
		'App\Http\Controllers\DatabaseController',
		'App\Http\Controllers\DonateController',
		'App\Http\Controllers\ForumController',
		'App\Http\Controllers\GetController',
		'App\Http\Controllers\GuideController',
		'App\Http\Controllers\HomeController',
		'App\Http\Controllers\LegalController',
		'App\Http\Controllers\LivestreamController',
		'App\Http\Controllers\MapController',
		'App\Http\Controllers\MediaController',
		'App\Http\Controllers\MembersController',
		'App\Http\Controllers\MessengerController',
		'App\Http\Controllers\NewsController',
		'App\Http\Controllers\PlayController',
		'App\Http\Controllers\ProfileController',
		'App\Http\Controllers\RadioController',
		'App\Http\Controllers\SettingsController',
		'App\Http\Controllers\SignatureController',
		'App\Http\Controllers\SocialController',
		'App\Http\Controllers\StaffController',
		'App\Http\Controllers\UtilityController',
	];

	/**
	 * Called before routes are registered.
	 *
	 * Register any model bindings or pattern based filters.
	 *
	 * @param  Router  $router
	 * @return void
	 */
	public function before(Router $router)
	{
		//
	}

	/**
	 * Define the routes for the application.
	 *
	 * @return void
	 */
	public function map(Router $router)
	{
		// require app_path('Http/routes.php');
	}

}
