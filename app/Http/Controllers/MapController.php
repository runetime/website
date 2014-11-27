<?php
namespace App\Http\Controllers;
/**
 * Class MapController
 * @package App\Http\Controllers
 */
class MapController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('navbar.runescape.runescape');
		$this->title(lang('maps.title'));
		return $this->view('map.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getMembers() {
		$this->bc(['map' => 'Maps']);
		$this->nav('navbar.social.social');
		$this->title(lang('maps.members.title'));
		return $this->view('map.members');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRunescape() {
		$this->bc(['map' => 'Maps']);
		$this->nav('navbar.runescape.runescape');
		$this->title(lang('maps.rs.title'));
		return $this->view('map.runescape.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRS3() {
		$this->bc(['map' => 'Maps', 'map/runescape' => 'RuneScape Maps']);
		$this->nav('navbar.runescape.runescape');
		$this->title(lang('maps.rs.rs3'));
		return $this->view('map.runescape.3');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getOS() {
		$this->bc(['map' => lang('maps.title'), 'map/runescape' => lang('maps.rs.title')]);
		$this->nav('navbar.runescape.runescape');
		$this->title(lang('maps.rs.osrs'));
		return $this->view('map.runescape.old');
	}
}