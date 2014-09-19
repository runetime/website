<?php
use Runis\Accounts\UserRepository;
class GetSignupController extends BaseController{
	private $users;
	public function __construct(UserRepository $users){
		$this->users=$users;
	}
	public function postEmail(){
		$available=true;
		if($this->users->getByEmail(Input::get('email')))
			$available=false;
		return json_encode(['available'=>$available]);
	}
	public function postUsername(){
		$available=true;
		if($this->users->getByUsername(Input::get('username'))||$this->users->getByDisplayName(Input::get('username')))
			$available=false;
		return json_encode(['available'=>$available]);
	}
}