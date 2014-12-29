<?php
namespace App\Http\Controllers;

class AboutController extends BaseController
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.title');
		$this->title('about.name');
		return $this->view('about');
	}
}