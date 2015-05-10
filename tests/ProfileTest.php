<?php

use App\RuneTime\Accounts\User;

/**
 * Tests HTTP routes for the ProfileController.
 *
 * Class ProfileTest
 */
class ProfileTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $user = User::orderBy('created_at', 'desc')->first();

        $response = $this->call('GET', 'profile/' . $user->id . '-' . $user->display_name);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testFeed()
    {
        $user = User::orderBy('created_at', 'desc')->first();

        $response = $this->call('GET', 'profile/' . $user->id . '-' . $user->display_name . '/feed');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
