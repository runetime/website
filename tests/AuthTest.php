<?php

class AuthTest extends TestCase {
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
		$credentials = [
			'email'        => 'test' . time() . '@example.net',
			'display_name' => 'test' . time(),
			'password'     => 'test',
			'password2'    => 'test',
		];
		$response = $this->action('POST', 'AuthController@postSignupForm', null, $credentials);
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

	public function testLoginPost()
	{
		$user = \App\Runis\Accounts\User::orderBy('created_at', 'desc')->first();
		$credentials = [
			'email'        => $user->email,
			'display_name' => $user->display_name,
			'password'     => 'test',
			'password2'    => 'test',
		];
		if(\Auth::validate($credentials))
			$this->assertTrue(true);
		else
			$this->assertFalse(true);
	}
}
