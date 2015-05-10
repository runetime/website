<?php

/**
 * Tests HTTP routes for the GuideController.
 *
 * Class GuideTest
 */
class GuideTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'guides');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testLocationIndex()
    {
        $response = $this->call('GET', 'guides/locations');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testLocationGetCreate()
    {
        $this->login();

        $response = $this->call('GET', 'guides/locations/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testLocationPostCreate()
    {
        $this->login();

        $data = $this->form([
            'name'     => 'test name',
            'contents' => 'test contents',
        ]);

        $response = $this->call('POST', 'guides/locations/create', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testLocationView()
    {
        $response = $this->call('GET', 'guides/locations/1-test');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testQuestIndex()
    {
        $response = $this->call('GET', 'guides/quests/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testQuestGetCreate()
    {
        $this->login();

        $response = $this->call('GET', 'guides/quests/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testQuestPostCreate()
    {
        $this->login();

        $data = $this->form([
            'name'               => 'name',
            'difficulty'         => 5,
            'length'             => 6,
            'membership'         => 11,
            'qp'                 => 4,
            'completed'          => 1,
            'description'        => 'description',
            'quest_requirements' => 'quest requirements',
            'skill_requirements' => 'skill requirements',
            'items_required'     => 'items_required',
            'items_recommended'  => 'items recommended',
            'rewards'            => 'rewards',
            'starting_point'     => 'starting point',
            'contents'           => 'contents',
        ]);

        $response = $this->call('POST', 'guides/quests/create', $data);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testQuestView()
    {
        $response = $this->call('GET', 'guides/quests/1-test');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
