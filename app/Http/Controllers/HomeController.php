<?php
namespace App\Http\Controllers;
use App\RuneTime\News\NewsRepository;
use App\RuneTime\Statuses\StatusRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
class HomeController extends BaseController {
	/**
	 * @var NewsRepository
	 */
	private $news;
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
	 * @param StatusRepository $statuses
	 * @param ThreadRepository $threads
	 */
	public function __construct(NewsRepository $news, StatusRepository $statuses, ThreadRepository $threads) {
		$this->news = $news;
		$this->statuses = $statuses;
		$this->threads = $threads;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$news = $this->news->getRecentNews(3);
		$statuses = $this->statuses->getRecentStatuses(5);
		$threads = $this->threads->getX(5);
		$this->bc(false);
		$this->nav('navbar.home');
		$this->title(trans('navbar.home'));
		return $this->view('home.index', compact('news', 'statuses', 'threads'));
	}
}