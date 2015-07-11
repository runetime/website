<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the DonateController.
 *
 * Class DonateTest
 */
final class DonateTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'donate');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
