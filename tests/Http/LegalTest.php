<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the LegalController.
 *
 * Class LegalTest
 */
class LegalTest extends Test
{
    /**
     *
     */
    public function testLegal()
    {
        $response = $this->call('GET', 'legal/english');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPrivacy()
    {
        $response = $this->call('GET', 'privacy');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testTerms()
    {
        $response = $this->call('GET', 'terms');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
