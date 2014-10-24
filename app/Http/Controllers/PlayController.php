<?php
namespace App\Http\Controllers;
class PlayController extends BaseController {
	/**
	 * @get("play")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->js('play');
		$this->nav('navbar.runescape.runescape');
		$this->title(trans('play.index.play_runescape'));
		return $this->view('play.index');
	}

	/**
	 * @get("play/3")
	 *
	 * @return \Illuminate\View\View
	 */
	public function get3() {
		$this->bc(['play' => trans('play.index.play_runescape')]);
		$this->js('play');
		$this->nav('navbar.runescape.runescape');
		$this->title(trans('play.index.3'));
		return $this->view('play.3');
	}

	/**
	 * @get("play/osrs")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getOSRS() {
		$this->bc(['play' => trans('play.index.play_runescape')]);
		$this->js('play');
		$this->nav('navbar.runescape.runescape');
		$this->title(trans('play.index.osrs'));
		return $this->view('play.osrs');
	}
}