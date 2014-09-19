<?php
use Runis\Accounts\User;
use Runis\Accounts\UserRepository;
class SignupController extends BaseController{
	private $users;
	public function __construct(UserRepository $users){
		$this->users=$users;
	}
	public function getForm(){
		$this->js('signup');
		$this->nav('Sign Up');
		$this->title('Sign Up');
		$this->view('signup.form');
	}
	public function postForm(){
		$this->nav('Sign Up');
		$this->title('Error Signing Up');
		if(Input::get('username')&&Input::get('email')&&Input::get('password')&&Input::get('password2')){
			if(Input::get('password')==Input::get('password2')){
				if(!$this->users->getByUsername(Input::get('username'))&&!$this->users->getByDisplayName(Input::get('username'))){
					$user=new User;
					$user->username=Input::get('username');
					$user->display_name=Input::get('username');
					$user->email=Input::get('email');
					$user->password=Hash::make(Input::get('password'));
					$user->save();
					$user->setRole('Members');
					Auth::loginUsingId($user->id);
					return $this->redirectAction('ForumSettingsController@getIndex');
				}
				else{
					$this->view('errors.signup.taken');
				}
			}
			else{
				$this->view('errors.signup.passwords');
			}
		}
		else{
			$this->view('errors.signup.input');
		}
	}
	public function userValidationError($errors){
		return var_dump($errors);
		return $this->redirectBack(['errors'=>$errors]);
	}
	public function userCreated($message){
		return $this->redirectAction('AwardController@getIndex');
	}
}