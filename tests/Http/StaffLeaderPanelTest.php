<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the StaffTeamLeaderController.
 *
 * Class StaffLeaderPanelTest
 */
final class StaffLeaderPanelTest extends Test
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
