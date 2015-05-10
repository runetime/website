<?php namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Routing\Middleware;
/**
 * Class Staff
 * @package App\Http\Middleware
 */
class Staff implements Middleware
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
		if(!\Auth::user()->hasOneOfRoles(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13)) {
			return \View::make('framework.unauthorized');
		}
		return $next($request);
	}

}
