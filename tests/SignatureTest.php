<?php

/**
 * Tests HTTP routes for the SignatureController.
 *
 * Class SignatureTest
 */
class SignatureTest extends TestCase
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
     *
     */
    public function testPostUsername()
    {
        $form = $this->form([
            'username' => 'zezima',
        ]);

        $response = $this->call('POST', 'signatures', $form);

        $this->assertEquals(200, $response->getStatusCode());
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
