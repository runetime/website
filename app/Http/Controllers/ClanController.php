<?php
namespace App\Http\Controllers;
use App\RuneTime\News\NewsRepository;
class ClanController extends BaseController {
	/**
	 * @param NewsRepository $news
	 */
	public function __construct(NewsRepository $news) {
		$this->news = $news;
	}

	/**
	 *
	 */
	public function getIndex() {
	}
}