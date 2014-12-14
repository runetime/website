<?php
namespace App\Http\Controllers;

use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\News\NewsRepository;
use App\RuneTime\Statuses\StatusRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;

class HomeController extends BaseController
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
		$news = $this->news->getRecentNews(3);
		$statuses = $this->statuses->getLatest(5);
		$threads = $this->threads->getX(5, 'desc');
		$posts = $this->posts->hasThread(5);
		$this->bc(false);
		$this->nav('navbar.home');
		$this->title(trans('navbar.home'));
		return $this->view('index', compact('news', 'statuses', 'threads', 'posts'));
	}
}