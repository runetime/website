<?php
namespace tests\Http;

use tests\TestCase;

/**
 * Tests HTTP routes for the PlayController.
 *
 * Class PlayTest
 */
class PlayTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'play');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test3()
    {
        $response = $this->call('GET', 'play/3');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testOS()
    {
        $response = $this->call('GET', 'play/osrs');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
