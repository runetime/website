<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the AboutController.
 *
 * Class AboutTest
 */
final class AboutTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'about');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
