<?php

/**
 * Tests HTTP routes for the AwardController.
 *
 * Class AwardTest
 */
class AwardTest extends TestCase
{
	/**
	 *
	 */
	public function testAwardsIndex()
	{
		$response = $this->call('GET', 'awards');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testAwardsView()
	{
		$response = $this->call('GET', 'awards/1-test');

		$this->assertEquals(200, $response->getStatusCode());
	}
}
