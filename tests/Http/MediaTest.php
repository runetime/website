<?php

/**
 * Tests HTTP routes for the MediaController.
 *
 * Class MediaTest
 */
class MediaTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'media');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
