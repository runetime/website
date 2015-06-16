<?php
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
        \Artisan::call('migrate');
        \Artisan::call('migrate:refresh');
        \Artisan::call('db:seed');

        $this->assertTrue(true);
    }
}
