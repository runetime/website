<?php
use App\Runis\Accounts\User;

class AuthTest extends TestCase {
	/**
	 * @param \App\Runis\Accounts\RoleRepository $roles
	 */
	public function __construct(\App\Runis\Accounts\RoleRepository $roles)
	{

	}
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

		$users = User::all();
		foreach($users as $user) {
			$user->roleRemove($user->importantRole());
			$role = $this->roles->getByName("Administrator");
			$user->roleAdd($role);
		}
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
		$user = User::orderBy('created_at', 'desc')->first();
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
