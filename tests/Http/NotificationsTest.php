<?php

/**
 * Tests HTTP routes for the NotificationController.
 *
 * Class NotificationsTest
 */
class NotificationsTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $this->login();

        $response = $this->call('GET', 'notifications');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testView()
    {
        $this->login();

        $response = $this->call('GET', 'notifications/1-at-123');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testSetAllRead()
    {
        $this->login();

        $response = $this->call('GET', 'notifications/set-all-read');

        $this->assertEquals(302, $response->getStatusCode());
    }
}
