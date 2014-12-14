<?php
namespace App\Http\Controllers;

class AboutController extends BaseController
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('about.name'));
		return $this->view('about');
	}
}