<?php

/**
 * Tests HTTP routes for the LanguageController.
 *
 * Class LanguageTest
 */
class LanguageTest extends TestCase
{
    /**
     *
     */
    public function testSet()
    {
        $response = $this->call('GET', 'language/set');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testChange()
    {
        $form = [
            'initials' => 'en',
        ];

        $response = $this->call('GET', 'language/set', $form);

        $this->assertEquals(200, $response->getStatusCode());
    }
}
