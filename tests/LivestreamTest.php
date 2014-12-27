<?php
class LivestreamTest extends TestCase {
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->call('GET', 'livestream');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testGetReset()
	{
		$response = $this->call('GET', 'livestream/reset');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostReset()
	{
		$data = $this->form();

		$response = $this->call('POST', 'livestream/reset', $data);

		$this->assertEquals(200, $response->getStatusCode());
	}
}