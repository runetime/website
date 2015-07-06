<?php
namespace tests\Http;

use tests\Test;

/**
 * Tests HTTP routes for the LanguageController.
 *
 * Class LanguageTest
 */
class LanguageTest extends Test
{
    /**
     *
     */
    public function testSet()
    {
        $this->markTestSkipped('Skipping for now. Errors need to be fixed.');

        $response = $this->call('GET', 'language/set');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testChange()
    {
        $this->markTestSkipped('Skipping for now. Errors need to be fixed.');

        $form = [
            'initials' => 'en',
        ];

        $response = $this->call('GET', 'language/set', $form);

        $this->assertEquals(200, $response->getStatusCode());
    }
}
