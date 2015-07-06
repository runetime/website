<?php
namespace tests\Http;

use App\RuneTime\Statuses\Status;
use tests\TestCase;

/**
 * Tests HTTP routes for the StatusController.
 *
 * Class StatusTest
 */
class StatusTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'forums/statuses');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testGetCreate()
    {
        $this->login();

        $response = $this->call('GET', 'forums/statuses/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostCreate()
    {
        $this->login();

        $data = $this->form([
            'contents' => 'contents',
        ]);

        $response = $this->call('POST', 'forums/statuses/create', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testView()
    {
        $status = Status::orderBy('created_at', 'desc')->first();

        $response = $this->call('GET', 'forums/statuses/' . $status->id . '-by-' . $status->author->display_name);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testReply()
    {
        $status = Status::orderBy('created_at', 'desc')->first();

        $data = $this->form();

        $response = $this->call('POST', 'forums/statuses/' . $status->id . '-by-' . $status->author->display_name . '/reply', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }
}
