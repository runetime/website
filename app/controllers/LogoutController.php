<?php
class LogoutController extends BaseController{
	public function getLogout(){
		Auth::logout();
		return $this->redirectAction('HomeController@getIndex');
	}
}