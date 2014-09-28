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
	public function postDisplayName(){
		$available=true;
		if($this->users->getByDisplayName(Input::get('display_name'))||$this->users->getByDisplayName(Input::get('display_name')))
			$available=false;
		return json_encode(['available'=>$available]);
	}
}