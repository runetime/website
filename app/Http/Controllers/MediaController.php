<?php
namespace App\Http\Controllers;
class MediaController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('Social');
		$this->title('Social Media');
		return $this->view('media');
	}
}