<?php
namespace tests\Http;

use tests\TestCase;

/**
 * Tests HTTP routes for the staff list.
 *
 * Class StaffListTest
 */
class StaffListTest extends TestCase
{
    /**
     *
     */
    public function testList()
    {
        $response = $this->call('GET', 'staff/list');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
