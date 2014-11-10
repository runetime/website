<?php
namespace App\Http\Controllers;
use App\RuneTime\News\NewsRepository;
/**
 * Class ClanController
 * @package App\Http\Controllers
 */
class ClanController extends BaseController {
	/**
	 * @var NewsRepository
	 */
	private $news;

	/**
	 * @param NewsRepository $news
	 */
	public function __construct(NewsRepository $news) {
		$this->news = $news;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('navbar.social.social');
		$this->title('RuneTime Clan');
		return $this->view('clan.index');
	}
}