<?php
class LegalController extends BaseController{
	public function getPrivacy(){
		$this->nav('RuneTime');
		$this->title('Privacy Policy');
		$this->view('legal.privacy');
	}
	public function getTerms(){
		$this->nav('RuneTime');
		$this->title('Terms of Use');
		$this->view('legal.terms');
	}
}