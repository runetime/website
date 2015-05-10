<?php

/**
 * Tests HTTP routes for the DatabaseController.
 *
 * Class DatabaseTest
 */
class DatabaseTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'databases');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testItemIndex()
    {
        $response = $this->call('GET', 'databases/items');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testItemGetCreate()
    {
        $this->login();

        $response = $this->call('GET', 'databases/items/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testItemPostCreate()
    {
        $this->login();
        $data = $this->form([
            'name'        => 'name',
            'examine'     => 'examine',
            'description' => 'description',
            'membership'  => 1,
            'tradable'    => 0,
            'quest_item'  => 1,
        ]);

        $response = $this->call('POST', 'databases/items/create', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testItemView()
    {
        $response = $this->call('GET', 'databases/items/1-test');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testMonsterIndex()
    {
        $response = $this->call('GET', 'databases/monsters');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testMonsterGetCreate()
    {
        $this->login();
        $response = $this->call('GET', 'databases/monsters/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testMonsterPostCreate()
    {
        $this->login();
        $data = $this->form([
            'name'              => 'name',
            'examine'           => 'examine',
            'stats'             => 'stats',
            'location'          => 'location',
            'drops'             => 'drops',
            'membership'        => 1,
            'other_information' => 'test_yes',
        ]);

        $response = $this->call('POST', 'databases/monsters/create', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testMonsterView()
    {
        $response = $this->call('GET', 'databases/monsters/1-test');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
