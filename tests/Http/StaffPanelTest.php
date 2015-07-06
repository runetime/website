<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the StaffController.
 *
 * Class StaffPanelTest
 */
class StaffPanelTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $this->login();

        $response = $this->call('GET', 'staff');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testUserReport()
    {
        $this->login();

        $user = \App\RuneTime\Accounts\User::find(1);
        $data = $this->form([
            'username' => $user->display_name,
            'reason'   => 'Staff Panel User Report Test',
        ]);

        $response = $this->call('POST', 'staff/report', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testUserMute()
    {
        $this->login();

        $user = \App\RuneTime\Accounts\User::find(1);
        $data = $this->form([
            'username' => $user->display_name,
            'reason'   => 'Staff Panel User Mute Test',
        ]);

        $response = $this->call('POST', 'staff/mute', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testGetCheckup()
    {
        $this->login();

        $response = $this->call('GET', 'staff/checkup');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostCheckup()
    {
        $this->login();

        $data = $this->form([
            'hours_active' => 7,
            'active'       => 0,
            'team'         => 'development',
        ]);

        $response = $this->call('POST', 'staff/checkup', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }
}
