<?php
namespace App\Http\Controllers;

class ClanController extends BaseController {

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('navbar.social.social');
		$this->title(trans('clan.title'));
		return $this->view('clan');
	}
}