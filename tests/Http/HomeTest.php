<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the HomeController.
 *
 * Class HomeTest
 */
class HomeTest extends Test
{
    /**
     *
     */
    public function testHomeIndex()
    {
        $response = $this->call('GET', '/');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
