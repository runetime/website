<?php

use \App\RuneTime\Messenger\Message;

class MessengerTest extends TestCase {
	/**
	 *
	 */
	public function testIndex()
	{
		$this->login();
		$response = $this->call('GET', 'messenger');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testGetCreate()
	{
		$this->login();
		$response = $this->call('GET', 'messenger/compose');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostCreate()
	{
		$this->login();
		$data = [
			'title'        => 'test title',
			'participants' => \Auth::user()->display_name,
			'contents'     => 'test contents',
		];
		$response = $this->call('POST', 'messenger/compose', $data);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testView()
	{
		$this->login();
		$message = Message::orderBy('created_at', 'desc')->first();
		$response = $this->call('GET', $message->toSlug());

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testReply()
	{
		$this->login();
		$message = Message::orderBy('created_at', 'desc')->first();
		$response = $this->call('POST', $message->toSlug() . '/reply');

		$this->assertEquals(302, $response->getStatusCode());
	}
}