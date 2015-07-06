<?php
namespace tests;

/**
 * Tests the database setup.
 *
 * Class AaTest
 */
final class AaTest extends Test
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
