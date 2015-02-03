<?php
namespace App\Http\Controllers;

/**
 * Class AboutController
 * @package App\Http\Controllers
 */
class AboutController extends Controller
{
	/**
	 * Returns the About page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.runetime.title');
		$this->title('about.name');
		return $this->view('about');
	}
}