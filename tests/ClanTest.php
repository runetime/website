<?php

/**
 * Tests HTTP routes for the ClanController.
 *
 * Class ClanTest
 */
class ClanTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->call('GET', 'clan');

		$this->assertEquals(200, $response->getStatusCode());
	}
}
