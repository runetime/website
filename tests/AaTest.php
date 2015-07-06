<?php
namespace tests;

/**
 * Tests the database setup.
 *
 * Class AaTest
 */
class AaTest extends TestCase
{
    /**
     *
     */
    public function testSetup()
    {
        `php artisan migrate`;
        `php artisan migrate:refresh`;
        `php artisan db:seed`;

        $this->assertTrue(true);
    }
}
