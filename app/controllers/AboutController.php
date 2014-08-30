<?php
class AboutController extends BaseController{
	public function getIndex(){
		$this->nav('RuneTime');
		$this->title('About Us');
		$this->view('about.index');
	}
}