<?php
use App\RuneTime\Chat\Channel;
use App\RuneTime\Chat\Chat;

class ChatTest extends TestCase {
	/**
	 *
	 */
	public function testStart()
	{
		$channel = Channel::orderBy('created_at', 'desc')->first();
		$form = [
			'channel' => $channel->name_trim,
		];
		$response = $this->call('POST', 'chat/start', $form);

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testUpdate()
	{
		$chat = Chat::find(1);
		$id = 1;
		if(!$chat)
			$id = 0;
		$form = [
			'id' => $chat->id,
		];
		$response = $this->call('POST', 'chat/update', $form);

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testMessage()
	{
		$this->login();
		$channel = Channel::orderBy('created_at', 'desc')->first();
		$data = [
			'channel' => $channel->name_trim,
			'contents' => '**test**',
		];
		$response = $this->call('POST', 'chat/post/message', $data);

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testChannels()
	{
		$response = $this->call('GET', 'chat/channels');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testCheckChannel()
	{
		$channel = Channel::orderBy('created_at', 'desc')->first();
		$data = [
			'channel' => $channel->id,
		];
		$response = $this->call('POST', 'chat/channels/check', $data);

		$this->assertEquals(200, $response->getStatusCode());
	}
}
