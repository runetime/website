<?php
namespace App\Http\Controllers;
class LegalController extends BaseController{
	public function getPrivacy(){
		$this->nav('RuneTime');
		$this->title('Privacy Policy');
		return $this->view('legal.privacy');
	}
	public function getTerms(){
		$this->nav('RuneTime');
		$this->title('Terms of Use');
		return $this->view('legal.terms');
	}
}