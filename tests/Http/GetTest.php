<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the GetController.
 *
 * Class GetTest
 */
class GetTest extends Test
{
    /**
     *
     */
    public function testEmail()
    {
        $form = $this->form([
            'email' => 'test' . microtime(true),
        ]);

        $response = $this->action('POST', 'GetController@postEmail', $form);

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testDisplayName()
    {
        $form = $this->form([
            'display_name' => 'test' . microtime(true),
        ]);

        $response = $this->action('POST', 'GetController@postDisplayName', $form);

        $this->assertEquals(200, $response->getStatusCode());
    }
}
