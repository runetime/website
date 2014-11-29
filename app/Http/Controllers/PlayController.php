<?php
namespace App\Http\Controllers;

class PlayController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->js(['chatbox']);
		$this->nav('navbar.runescape.runescape');
		$this->title(trans('play.index.play_runescape'));
		return $this->view('play.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function get3() {
		$this->bc(['play' => trans('play.index.play_runescape')]);
		$this->nav('navbar.runescape.runescape');
		$this->title(trans('play.index.3'));
		return $this->view('play.3');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getOSRS() {
		$this->bc(['play' => trans('play.index.play_runescape')]);
		$this->nav('navbar.runescape.runescape');
		$this->title(trans('play.index.osrs'));
		return $this->view('play.osrs');
	}
}