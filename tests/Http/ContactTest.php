<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the ContactController.
 *
 * Class ContactTest
 */
final class ContactTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->action('GET', 'ContactController@getIndex');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testSubmit()
    {
        $data = $this->form([
            'contents' => 'test contact',
            'email'    => 'test@phpunit.test',
        ]);

        $response = $this->action('POST', 'ContactController@postSubmit', $data);

        $this->assertEquals(200, $response->getStatusCode());
    }
}
