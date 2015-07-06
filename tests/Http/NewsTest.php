<?php
namespace tests\Http;

use App\RuneTime\News\News;
use tests\Test;

/**
 * Tests HTTP routes for the NewsController.
 * Class NewsTest
 */
class NewsTest extends Test
{
    /**
     *
     */
    public function testIndex()
    {
        $response = $this->call('GET', 'news');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testGetCreate()
    {
        $this->login();

        $response = $this->call('GET', 'news/create');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     *
     */
    public function testPostCreate()
    {
        $this->login();

        $data = $this->form([
            'contents' => 'test_contents',
            'name'     => 'test_name',
            'tags'     => 'test, phpunit',
        ]);

        $response = $this->call('POST', 'news/create', $data);

        switch ($response->getStatusCode()) {
            case 200:
            case 302:
                $this->assertTrue(true);
                break;
            default:
                $this->assertFalse(true);
                break;
        }
    }

    /**
     *
     */
    public function testView()
    {
        $news = $this->createNews();

        $response = $this->call('GET', $news->toSlug());

        $this->assertEquals(200, $response->getStatusCode());
    }
}
