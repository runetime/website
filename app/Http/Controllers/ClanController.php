<?php
namespace App\Http\Controllers;

class ClanController extends Controller
{

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.social.title');
		$this->title('clan.title');
		return $this->view('clan');
	}
}