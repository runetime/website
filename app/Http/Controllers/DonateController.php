<?php
namespace App\Http\Controllers;
class DonateController extends BaseController{
	/**
	 * @get("donate")
	 * @return \Illuminate\View\View
	 */
	public function getIndex(){
		$this->nav('RuneTime');
		$this->title('Donate to RuneTime');
		return $this->view('donate.index');
	}
}