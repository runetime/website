<?php
namespace App\Http\Controllers;
class AboutController extends BaseController {
	/**
	 * @get("about")
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('RuneTime');
		$this->title('About Us');
		return $this->view('about.index');
	}
}