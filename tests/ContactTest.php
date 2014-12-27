<?php
class ContactTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->action('GET', 'ContactController@getIndex');

		$this->assertEquals(200, $response->getStatusCode());
	}

	public function testSubmit()
	{
		$data = $this->form([
			'contents' => 'test contact',
			'email'    => 'test@phpunit.test',
		]);

		$response = $this->action('POST', 'ContactController@postSubmit', $data);

		$this->assertEquals(200, $response->getStatusCode());
	}
}
