<?php
namespace App\Http\Controllers;

class AboutController extends Controller
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