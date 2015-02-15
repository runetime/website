<?php

/**
 * Tests HTTP routes for the TransparencyController.
 *
 * Class TransparencyTest
 */
class TransparencyTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->call('GET', 'transparency');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testMarkdown()
	{
		$response = $this->call('GET', 'transparency/markdown');

		$this->assertEquals(200, $response->getStatusCode());
	}
}
