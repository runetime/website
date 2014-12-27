<?php
class StaffLeaderPanelTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$this->login();

		$response = $this->call('GET', 'staff/leader');

		$this->assertEquals(200, $response->getStatusCode());
	}

	public function testDemoteStaff()
	{
		$this->login();

		$response = $this->call('GET', 'staff/leader');

		$this->assertEquals(200, $response->getStatusCode());
	}

	public function testTempBan()
	{
		$this->login();

		$response = $this->call('GET', 'staff/leader');

		$this->assertEquals(200, $response->getStatusCode());
	}

	public function testMuteUser()
	{
		$this->login();

		$response = $this->call('GET', 'staff/leader');

		$this->assertEquals(200, $response->getStatusCode());
	}

	public function testClearChatbox()
	{
		$this->login();

		$response = $this->call('GET', 'staff/leader');

		$this->assertEquals(200, $response->getStatusCode());
	}
}