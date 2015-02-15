<?php

/**
 * Tests HTTP routes for the AboutController.
 *
 * Class AboutTest
 */
class AboutTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->call('GET', 'about');

		$this->assertEquals(200, $response->getStatusCode());
	}
}
