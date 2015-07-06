<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the ClanController.
 *
 * Class ClanTest
 */
final class ClanTest extends Test
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
