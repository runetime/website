<?php

class AuthSignupTest extends TestCase {

	/**
	 * A basic functional test example.
	 *
	 * @return void
	 */
	public function testBasicExample()
	{
		$response = $this->call('GET', 'signup');

		$this->assertEquals(200, $response->getStatusCode());
	}

}
