<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the MapController DO NOT WORK because
 * the maps were removed.
 *
 * Class MapTest
 */
final class MapTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'map');

        $this->assertEquals(404, $response->getStatusCode());
    }

    /**
     *
     */
    public function testRS()
    {
        $response = $this->call('GET', 'map/runescape');

        $this->assertEquals(404, $response->getStatusCode());
    }

    /**
     *
     */
    public function testRS3()
    {
        $response = $this->call('GET', 'map/runescape/3');

        $this->assertEquals(404, $response->getStatusCode());
    }

    /**
     *
     */
    public function testRSOS()
    {
        $response = $this->call('GET', 'map/runescape/old-school');

        $this->assertEquals(404, $response->getStatusCode());
    }
}
