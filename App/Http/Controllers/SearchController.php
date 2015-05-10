<?php
namespace App\Http\Controllers;

use App\Http\Requests\Search\SearchRequest;
use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\News\NewsRepository;

/**
 * Class SearchController
 */
class SearchController extends Controller
{
    /**
     * @var NewsRepository
     */
    private $news;
    /**
     * @var ThreadRepository
     */
    private $threads;
    /**
     * @var UserRepository
     */
    private $users;

    /**
     * @param NewsRepository   $news
     * @param ThreadRepository $threads
     * @param UserRepository   $users
     */
    public function __construct(
        NewsRepository $news,
        ThreadRepository $threads,
        UserRepository $users
    ) {
        $this->news = $news;
        $this->threads = $threads;
        $this->users = $users;
    }

    /**
     * @param SearchRequest $form
     *
     * @return string
     */
    public function postSubmit(SearchRequest $form)
    {
        $response = [
            'news'    => [],
            'threads' => [],
            'users'   => [],
        ];

        $listNews = $this->news->getLikeName($form->contents, 6);
        $listThreads = $this->threads->getLikeName($form->contents, 6);
        $listUsers = $this->users->getLikeDisplayName($form->contents, 6);

        foreach ($listNews as $news) {
            $obj = new \stdClass;
            $obj->img = $news->hasImage();
            $obj->name = $news->title;
            $obj->url = $news->toSlug();

            array_push($response['news'], $obj);
        }

        foreach ($listThreads as $thread) {
            $obj = new \stdClass;
            $obj->img = $thread->author->hasImage();
            $obj->name = $thread->title;
            $obj->url = $thread->toSlug();

            array_push($response['threads'], $obj);
        }

        foreach ($listUsers as $user) {
            $obj = new \stdClass;
            $obj->img = $user->hasImage();
            $obj->name = $user->display_name;
            $obj->url = $user->toSlug();

            array_push($response['users'], $obj);
        }

        return json_encode($response);
    }
}
