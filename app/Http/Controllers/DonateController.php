<?php
namespace App\Http\Controllers;

class DonateController extends BaseController
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.title');
		$this->title('donate.title');
		return $this->view('donate');
	}
}