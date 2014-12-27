<?php
use App\RuneTime\News\News;

class NewsTest extends TestCase
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

		switch($response->getStatusCode()) {
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
		$news = News::find(1);
		$response = $this->call('GET', 'news/1-test');

		$this->assertEquals(200, $response->getStatusCode());
	}
}