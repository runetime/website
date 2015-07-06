<?php
namespace tests\Http;

use tests\TestCase;

/**
 * Tests HTTP routes for the SettingsController.
 *
 * Class SettingsTest
 */
class SettingsTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $this->login();

        $response = $this->call('GET', 'settings');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostIndex()
    {
        $this->login();

        $data = $this->form([
            'referred_by' => 'Zezima',
            'birthday'    => 'now',
            'timezone'    => '14',
            'dst'         => 1,
            'gender'      => 2,
            'location'    => 'RuneTime',
            'interests'   => 'Development',
        ]);

        $response = $this->call('POST', 'settings', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPhoto()
    {
        $this->login();

        $response = $this->call('GET', 'settings/photo');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostPhoto()
    {
        $this->login();

        $data = $this->form();

        $response = $this->call('POST', 'settings/photo', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPassword()
    {
        $this->login();

        $response = $this->call('GET', 'settings/password');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostPassword()
    {
        $this->login();

        $data = $this->form([
            'new' => 'test',
        ]);

        $response = $this->call('POST', 'settings/password', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testAbout()
    {
        $this->login();

        $response = $this->call('GET', 'settings/about-me');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostAbout()
    {
        $this->login();

        $data = $this->form([
            'contents' => '**about me**',
        ]);

        $response = $this->call('POST', 'settings/about-me', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testSignature()
    {
        $this->login();

        $response = $this->call('GET', 'settings/signature');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostSignature()
    {
        $this->login();

        $data = $this->form([
            'contents' => '_my signature_',
        ]);

        $response = $this->call('POST', 'settings/signature', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testSocial()
    {
        $this->login();

        $response = $this->call('GET', 'settings/social');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostSocial()
    {
        $this->login();

        $data = $this->form([
            'twitter'  => 'Rune_Time',
            'facebook' => 'RuneTimeOfficial',
            'youtube'  => 'RuneTimeOfficial',
            'website'  => 'http://runetime.com',
            'skype'    => 'N/A',
        ]);

        $response = $this->call('POST', 'settings/social', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testRunescape()
    {
        $this->login();

        $response = $this->call('GET', 'settings/runescape');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostRunescape()
    {
        $this->markTestSkipped('Skipping for now. Errors need to be fixed.');

        $this->login();

        $data = $this->form([
            'version'    => 'RuneScape 3',
            'allegiance' => 'Zamorak',
            'rsn'        => 'zezima',
            'clan'       => 'urface',
        ]);

        $response = $this->call('POST', 'settings/runescape', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }
}
