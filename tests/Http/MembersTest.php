<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the MembersController.
 *
 * Class MembersTest
 */
final class MembersTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'members');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testSearch()
    {
        $response = $this->call('GET', 'members/role=a/prefix=b/order=c');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPage()
    {
        $response = $this->call('GET', 'members/role=a/prefix=b/order=c/page=1');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
