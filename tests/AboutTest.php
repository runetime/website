<?php

class AboutTest extends TestCase {
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->call('GET', 'about');

		$this->assertEquals(200, $response->getStatusCode());
	}
}
