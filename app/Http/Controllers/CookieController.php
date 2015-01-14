<?php
namespace App\Http\Controllers;

class CookieController extends Controller {
	/**
	 *
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.title');
		$this->title('cookies.title');
		return $this->view('cookies');
	}
}