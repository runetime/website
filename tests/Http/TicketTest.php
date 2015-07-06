<?php

/**
 * Tests HTTP routes for the TicketController.
 *
 * Class TicketTest
 */
class TicketTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $this->login();

        $response = $this->call('GET', 'tickets');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testGetCreate()
    {
        $this->login();

        $response = $this->call('GET', 'tickets/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostCreate()
    {
        $this->login();

        $data = $this->form([
            'name'     => 'test_name',
            'contents' => 'test_contents',
        ]);

        $response = $this->call('POST', 'tickets/create', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testView()
    {
        $this->login();

        $response = $this->call('GET', 'tickets/1-test');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testReply()
    {
        $this->login();

        $data = $this->form([
            'contents' => 'test_contents',
        ]);

        $response = $this->call('POST', 'tickets/1-test/reply', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testManageIndex()
    {
        $this->login();

        $response = $this->call('GET', 'tickets/manage');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testSwitch()
    {
        $this->login();

        $newStatus = \App\RuneTime\Tickets\Ticket::STATUS_CLOSED;
        $response = $this->call('GET', 'tickets/1-test/status/switch=' . $newStatus);

        $this->assertEquals(302, $response->getStatusCode());
    }
}
