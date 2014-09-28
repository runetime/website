<?php
namespace App\Http\Controllers;
class DonateController extends BaseController{
	public function getIndex(){
		$this->nav('RuneTime');
		$this->title('Donate to RuneTime');
		return $this->view('donate.index');
	}
}