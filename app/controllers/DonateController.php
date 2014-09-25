<?php
class DonateController extends BaseController{
	public function getIndex(){
		$this->nav('RuneTime');
		$this->title('Donate to RuneTime');
		$this->view('donate.index');
	}
}