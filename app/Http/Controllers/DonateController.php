<?php
namespace App\Http\Controllers;

class DonateController extends BaseController{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex(){
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('donate.title'));
		return $this->view('donate.index');
	}
}