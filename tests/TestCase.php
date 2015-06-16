<?php

use App\RuneTime\Accounts\User;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\News\News;

/**
 * The base class for HTTP tests.
 *
 * Class TestCase
 */
class TestCase extends Illuminate\Foundation\Testing\TestCase
{
    /**
     * The base URL to use while testing the application.
     *
     * @var string
     */
    protected $baseUrl = 'http://localhost';

    /**
     *
     */
    public function setUp()
    {
        parent::setUp();
        \Session::start();
    }

    /**
     * @return mixed
     */
    public function createApplication()
    {
        $app = require __DIR__ . '/../bootstrap/app.php';

        $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }

    /**
     * Logs the user in for a session and returns the auth Id.
     *
     * @return int
     */
    public function login()
    {
        $user = User::orderBy('created_at', 'desc')->first();
        \Auth::loginUsingId($user->id);

        return $user->id;
    }

    /**
     * @param array $form
     *
     * @return array
     */
    public function form(Array $form = [])
    {
        $form['_token'] = \Session::token();

        return $form;
    }

    /**
     * Creates a new News entity.
     *
     * @return News
     */
    public function createNews()
    {
        $authId = $this->login();

        return News::create([
            'author_id'       => $authId,
            'title'           => 'title',
            'contents'        => 'test',
            'contents_parsed' => 'test',
            'post_count'      => 0,
            'status'          => News::STATUS_PUBLISHED,
        ]);
    }

    /**
     * Creates a new Post entity.
     *
     * @return Post
     */
    public function createPost()
    {
        return Post::create([
            'author_id'       => $this->login(),
            'rep'             => 0,
            'status'          => Post::STATUS_VISIBLE,
            'ip'              => \String::encodeIP(),
            'contents'        => 'test',
            'contents_parsed' => 'test',
        ]);
    }

    /**
     * Creates a new Thread entity.
     *
     * @return Thread
     */
    protected function createThread()
    {
        $authId = $this->login();

        return Thread::create([
            'author_id'   => $authId,
            'subforum_id' => 1,
            'title'       => 'test',
            'views_count' => 0,
            'posts_count' => 1,
            'last_post'   => 0,
            'poll_id'     => -1,
            'status'      => Thread::STATUS_VISIBLE,
        ]);
    }
}
