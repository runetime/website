<?php
namespace App\Http\Controllers;
class AboutController extends BaseController{
	public function getIndex(){
		$this->nav('RuneTime');
		$this->title('About Us');
		return $this->view('about.index');
	}
}