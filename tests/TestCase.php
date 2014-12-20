<?php
use App\Runis\Accounts\User;

class TestCase extends Illuminate\Foundation\Testing\TestCase {
	/**
	 *
	 */
	public function setUp()
	{
		parent::setUp();
		\Session::start();
	}

	/**
	 * @return mixed
	 */
	public function createApplication()
	{
		$app = require __DIR__.'/../bootstrap/app.php';

		$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

		return $app;
	}

	/**
	 *
	 */
	public function login()
	{
		$user = User::orderBy('created_at', 'desc')->first();
		\Auth::loginUsingId($user->id);
	}

	/**
	 * @param $form
	 *
	 * @return mixed
	 */
	public function form($form)
	{
		$form['_token'] = csrf_token();

		return $form;
	}

}
