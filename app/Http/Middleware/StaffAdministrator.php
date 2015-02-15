<?php namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Routing\Middleware;

/**
 * Class StaffAdministrator
 * @package App\Http\Middleware
 */
class StaffAdministrator implements Middleware
{

	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
		if(!\Auth::check()) {
			return \redirect()->to('/login');
		}
		if(!\Auth::user()->hasOneOfRoles(1)) {
			return \View::make('framework.unauthorized');
		}
		return $next($request);
	}

}
