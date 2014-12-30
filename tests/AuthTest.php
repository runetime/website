<?php

use App\RuneTime\Accounts\User;

class AuthTest extends TestCase
{
	/**
	 *
	 */
	public function testSignupIndex()
	{
		$response = $this->call('GET', 'signup');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testSignupPost()
	{
		$credentials = $this->form([
			'email'        => 'test' . time() . '@example.net',
			'display_name' => 'test' . time(),
			'password'     => 'test',
			'password2'    => 'test',
		]);

		$response = $this->action('POST', 'AuthController@postSignupForm', null, $credentials);

		$user = User::orderBy('created_at', 'desc')->first();
		$user->roleRemove($user->importantRole());

		$roles = \App::make('App\RuneTime\Accounts\RoleRepository');
		$role = $roles->getByName("Administrator");

		$user->roleAdd($role, true);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testLoginIndex()
	{
		$response = $this->call('GET', 'login');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testLoginPost()
	{
		$user = User::orderBy('created_at', 'desc')->first();
		$credentials = [
			'email'        => $user->email,
			'display_name' => $user->display_name,
			'password'     => 'test',
			'password2'    => 'test',
		];

		if(\Auth::validate($credentials)) {
			$this->assertTrue(true);
		} else {
			$this->assertFalse(true);
		}
	}
}
