<?php

class TestCase extends Illuminate\Foundation\Testing\TestCase {
	public function setUp()
	{
		parent::setUp();
		Session::start();
	}

	/**
	 * Creates the application.
	 *
	 * @return \Illuminate\Foundation\Application
	 */
	public function createApplication()
	{
		$app = require __DIR__.'/../bootstrap/app.php';

		$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

		return $app;
	}

}
