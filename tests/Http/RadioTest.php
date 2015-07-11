<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the RadioController.
 *
 * Class RadioTest
 */
final class RadioTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'radio');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testHistory()
    {
        $response = $this->call('GET', 'radio/history');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testTimetable()
    {
        $response = $this->call('GET', 'radio/timetable');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostRequest()
    {
        $this->login();

        $form = $this->form([
            'artist' => 'test_artist',
            'name'   => 'test_name',
        ]);

        $response = $this->call('POST', 'radio/request/song', $form);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testUpdate()
    {
        $response = $this->call('GET', 'radio/update');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
