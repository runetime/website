<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the PlayController.
 *
 * Class PlayTest
 */
final class PlayTest extends Test
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
