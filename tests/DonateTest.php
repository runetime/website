<?php

/**
 * Tests HTTP routes for the DonateController.
 *
 * Class DonateTest
 */
class DonateTest extends TestCase
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
