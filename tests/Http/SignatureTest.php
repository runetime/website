<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the SignatureController.
 *
 * Class SignatureTest
 */
class SignatureTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'signatures');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * Ensure that posting to the signature generator redirects
     * to the page where you select a background image.
     */
    public function testPostUsername()
    {
        $form = $this->form([
            'username' => 'zezima',
        ]);

        $response = $this->call('POST', 'signatures', $form);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /**
     *
     */
    public function testFinal()
    {
        $response = $this->call('GET', 'signatures/username=zezima/type=stat/style=wp061ca5fe_06');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
