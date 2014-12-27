<?php
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