<?php

/**
 * Tests HTTP routes for the MapController.
 *
 * Class MapTest
 */
class MapTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'map');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testRS()
    {
        $response = $this->call('GET', 'map/runescape');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testRS3()
    {
        $response = $this->call('GET', 'map/runescape/3');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testRSOS()
    {
        $response = $this->call('GET', 'map/runescape/old-school');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
