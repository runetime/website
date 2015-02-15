<?php

/**
 * Tests HTTP routes for the controllers: ForumController,
 * ForumPostController, and the ForumThreadController.
 *
 * Class ForumTest
 */
class ForumTest extends TestCase
{
	/**
	 *
	 */
	public function testIndex()
	{
		$response = $this->call('GET', 'forums');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testSubforum()
	{
		$subforum = \App\RuneTime\Forum\Subforums\Subforum::first();
		$response = $this->call('GET', $subforum->toSlug());

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testThreadGetCreate()
	{
		$this->login();

		$response = $this->call('GET', 'forums/create/10-test');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testThreadPostCreate()
	{
		$this->login();

		$data = $this->form([
			'title'    => 'title',
			'questions' => [],
			'answers'   => [],
			'contents' => 'contents',
		]);

		$response = $this->call('POST', 'forums/create/10-test', $data);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testThreadView()
	{
		$response = $this->call('GET', 'forums/thread/1-test');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testThreadLastPost()
	{
		$response = $this->call('GET', 'forums/thread/1-test/last-post');

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testThreadReply()
	{
		$this->login();

		$data = $this->form([
			'contents' => 'test',
		]);

		$response = $this->call('POST', 'forums/thread/1-test/reply', $data);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testTagSearch()
	{
		$response = $this->call('GET', 'forums/tag/test');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostGetReport()
	{
		$this->login();

		$post = \App\RuneTime\Forum\Threads\Post::orderBy('created_at', 'desc')->first();

		$response = $this->call('GET', 'forums/post/' . $post->id . '/report');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostPostReport()
	{
		$this->login();

		$post = \App\RuneTime\Forum\Threads\Post::orderBy('created_at', 'desc')->first();
		$data = $this->form([
			'contents' => 'bad post',
		]);

		$response = $this->call('POST', 'forums/post/' . $post->id . '/report', $data);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostVote()
	{
		$this->login();

		$post = \App\RuneTime\Forum\Threads\Post::orderBy('created_at', 'desc')->first();
		$data = $this->form([
			'vote' => 'up',
		]);

		$response = $this->call('POST', 'forums/post/' . $post->id . '/report', $data);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostGetEdit()
	{
		$this->login();

		$info = \DB::table('post_thread')->orderBy('thread_id', 'desc')->first();

		$response = $this->call('GET', 'forums/post/' . $info->post_id . '/edit');

		$this->assertEquals(200, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostPostEdit()
	{
		$this->login();

		$thread = \App\RuneTime\Forum\Threads\Thread::find(1);
		$post = $thread->lastPost();
		$data = $this->form([
			'contents' => 'test edit',
		]);

		$response = $this->call('POST', 'forums/post/' . $post->id . '/edit', $data);

		$this->assertEquals(302, $response->getStatusCode());
	}

	/**
	 *
	 */
	public function testPostDelete()
	{
		$this->login();

		$info = \DB::table('post_thread')->orderBy('thread_id', 'desc')->first();

		$response = $this->call('GET', 'forums/post/' . $info->post_id . '/delete');

		$this->assertEquals(302, $response->getStatusCode());
	}
}