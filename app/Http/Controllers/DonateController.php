<?php
namespace App\Http\Controllers;

/**
 * Class DonateController
 * @package App\Http\Controllers
 */
class DonateController extends Controller
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