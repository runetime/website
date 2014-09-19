<?php
class LoginController extends BaseController{
	public function getForm(){
		$this->nav('Login');
		$this->title('Login');
		$this->view('login.form');
	}
	public function postForm(){
		if(Input::get('email')&&Input::get('password'))
			if(Auth::attempt(['email'=>Input::get('email'),'password'=>Input::get('password')],true))
				return Redirect::action('HomeController@getIndex');
		return Redirect::action('LoginController@getForm');
	}
}