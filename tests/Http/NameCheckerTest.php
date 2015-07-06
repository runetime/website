<?php

/**
 * Tests HTTP routes for the NameCheckerController.
 *
 * Class NameCheckerTest
 */
class NameCheckerTest extends TestCase
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'name-check');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPost()
    {
        $data = $this->form([
            'rsn' => 'zezima',
        ]);

        $response = $this->call('POST', 'name-check', $data);

        $this->assertEquals(200, $response->getStatusCode());
    }
}
