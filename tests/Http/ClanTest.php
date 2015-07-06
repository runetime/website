<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the ClanController.
 *
 * Class ClanTest
 */
class ClanTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'clan');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
