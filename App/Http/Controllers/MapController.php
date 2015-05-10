<?php
namespace App\Http\Controllers;

/**
 * Class MapController
 * @package App\Http\Controllers
 */
class MapController extends Controller {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runescape.title');
		$this->title('maps.title');
		return $this->view('map.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getMembers()
	{
		$this->bc(['map' => trans('maps.title')]);
		$this->nav('navbar.social.title');
		$this->title('maps.members.title');
		return $this->view('map.members');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRunescape()
	{
		$this->bc(['map' => trans('maps.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('maps.rs.title');
		return $this->view('map.runescape.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRS3()
	{
		$this->bc(['map' => 'Maps', 'map/runescape' => trans('maps.rs.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('maps.rs.rs3');
		return $this->view('map.runescape.3');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getOS()
	{
		$this->bc(['map' => trans('maps.title'), 'map/runescape' => trans('maps.rs.title')]);
		$this->nav('navbar.runescape.title');
		$this->title('maps.rs.osrs');
		return $this->view('map.runescape.old');
	}
}