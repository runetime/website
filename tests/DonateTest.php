<?php
class DonateTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->call('GET', 'donate');

		$this->assertEquals(200, $response->getStatusCode());
	}
}
