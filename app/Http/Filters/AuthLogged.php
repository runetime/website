<?php namespace App\Http\Filters;

use Illuminate\Http\Request;
use Illuminate\Routing\Route;

class AuthLogged {

	/**
	 * Run the request filter.
	 *
	 * @param  Route  $route
	 * @param  Request  $request
	 * @return mixed
	 */
	public function filter(Route $route, Request $request)
	{
		if(!\Auth::check())
			return redirect()->action('AuthController@getLoginForm');
	}

}
