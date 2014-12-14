<?php namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Routing\Middleware;

class StaffModerator implements Middleware
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
		if(!\Auth::user()->hasOneOfRoles(1, 10, 11)) {
			return \View::make('framework.unauthorized');
		}
		return $next($request);
	}

}
