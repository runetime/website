<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the MediaController.
 *
 * Class MediaTest
 */
final class MediaTest extends Test
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
