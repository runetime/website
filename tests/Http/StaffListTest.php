<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the staff list.
 *
 * Class StaffListTest
 */
final class StaffListTest extends Test
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
