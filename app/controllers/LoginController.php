<?php
class LoginController extends BaseController{
	public function getIndex(){
		$this->title('Login');
		$this->view('login.index');
	}
}