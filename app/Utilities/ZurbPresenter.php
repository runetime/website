<?php
namespace App\Utilities;
class ZurbPresenter {
	private $baseURL;

	/**
	 * @param $url
	 */
	public function url($url) {
		$this->baseURL = $url;
	}

	/**
	 * @param $text
	 *
	 * @return string
	 */
	public function getActivePageWrapper($text) {
		return "<li class='active'><a>" . $text . "</a></li>";
	}

	/**
	 * @param $text
	 *
	 * @return string
	 */
	public function getDisabledTextWrapper($text) {
		return "<li class='disabled'><a>" . $text . "</a></li>";
	}

	/**
	 * @param      $url
	 * @param      $page
	 * @param null $rel
	 *
	 * @return string
	 */
	public function getPageLinkWrapper($url, $page, $rel = null) {
		return "<li><a href='" . $this->baseURL . "/page=".$page."'>" . $page . "</a></li>";
	}
}