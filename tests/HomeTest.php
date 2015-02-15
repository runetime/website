<?php

/**
 * Tests HTTP routes for the HomeController.
 *
 * Class HomeTest
 */
class HomeTest extends TestCase
{
	/**
	 *
	 */
	public function testHomeIndex()
	{
		$response = $this->call('GET', '/');

		$this->assertEquals(200, $response->getStatusCode());
	}
}