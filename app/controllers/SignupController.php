<?php
use Runis\Accounts\UserCreator;
use Runis\Accounts\UserCreatorForm;
use Runis\Accounts\UserCreatorListener;
class SignupController extends BaseController implements UserCreatorListener{
	protected $userCreator;
	public function __construct(UserCreator $userCreator){
		$this->userCreator=$userCreator;
	}
	public function getForm(){
		$this->js('signup');
		$this->title('Sign Up');
		$this->view('signup.form');
	}
	public function postForm(){
		if(Input::get('username')&&Input::get('email')&&Input::get('password')&&Input::get('password2')){
			if(Input::get('password')==Input::get('password2')){
				$user=new User;
				$user->username=Input::get('username');
				$user->email=Input::get('email');
				$user->password=Hash::make(Input::get('password'));
				$user->save();
				Auth::loginUsingId($user->id);
				return $this->redirectAction('ForumSettingsController@getIndex');
			}
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