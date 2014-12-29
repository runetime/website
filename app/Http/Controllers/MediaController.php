<?php
namespace App\Http\Controllers;

class MediaController extends BaseController
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.social.title');
		$this->title('media.title');
		return $this->view('media');
	}
}