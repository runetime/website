<?php
class StaffAdminTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->action('GET', 'StaffAdminController@getIndex');

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testCheckupList()
	{
		$response = $this->action('GET', 'StaffAdminController@getUserList');

//		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testIpBan()
	{
		$this->login();

		$data = $this->form([
			'ip' => '127.123.123.123',
		]);

		$response = $this->action('POST', 'StaffAdminController@postIpBan', $data);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testRadioStop()
	{
		$this->login();

		$data = $this->form();

		$response = $this->action('POST', 'StaffAdminController@postRadioStop', $data);

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testUserChatboxRemove()
	{
		$this->login();

		$user = \App\RuneTime\Accounts\User::first();
		$data = $this->form([
			'username' => $user->display_name,
		]);

		$response = $this->action(
			'POST',
			'StaffAdminController@postUserChatboxRemove',
			$data
		);

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostUserForumPosts()
	{
		$this->login();

		$user = \App\RuneTime\Accounts\User::first();
		$data = $this->form([
			'username' => $user->display_name,
		]);

		$response = $this->action('POST', 'StaffAdminController@postUserForumPosts', $data);

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testGetUserList()
	{
		$response = $this->action('GET', 'StaffAdminController@getUserList');

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostUserSearch()
	{
		$this->login();

		$data = $this->form([
			'name' => 't',
		]);

		$response = $this->action('POST', 'StaffAdminController@postUserSearch', $data);

		$this->assertEquals(200, $response->getStatusCode());
	}
}
