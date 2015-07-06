<?php
namespace App\Http\Controllers;

use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\News\NewsRepository;
use App\RuneTime\Statuses\StatusRepository;

/**
 * Class HomeController
 */
final class HomeController extends Controller
{
    /**
     * @var NewsRepository
     */
    private $news;
    /**
     * @var PostRepository
     */
    private $posts;
    /**
     * @var StatusRepository
     */
    private $statuses;
    /**
     * @var ThreadRepository
     */
    private $threads;

    /**
     * @param NewsRepository   $news
     * @param PostRepository   $posts
     * @param StatusRepository $statuses
     * @param ThreadRepository $threads
     */
    public function __construct(NewsRepository $news, PostRepository $posts, StatusRepository $statuses, ThreadRepository $threads)
    {
        $this->news = $news;
        $this->posts = $posts;
        $this->statuses = $statuses;
        $this->threads = $threads;
    }

    /**
     * @return \Illuminate\View\View
     */
    public function getIndex()
    {
        $news = $this->news->getRecentCanView(5);
        $statuses = $this->statuses->getXCanView(5);
        $threads = $this->threads->getXCanView(5, 'desc');
        $posts = $this->posts->hasThreadCanView(5);

        $this->bc(false);
        $this->nav('navbar.home');
        $this->title('navbar.home');

        return $this->view('home', compact('news', 'statuses', 'threads', 'posts'));
    }
}
