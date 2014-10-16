<?php
namespace App\Http\Controllers;
class LegalController extends BaseController {
	/**
	 * @get("privacy")
	 * @return \Illuminate\View\View
	 */
	public function getPrivacy() {
		$this->nav('RuneTime');
		$this->title('Privacy Policy');
		return $this->view('legal.privacy');
	}

	/**
	 * @get("terms")
	 * @return \Illuminate\View\View
	 */
	public function getTerms() {
		$this->nav('RuneTime');
		$this->title('Terms of Use');
		return $this->view('legal.terms');
	}
}