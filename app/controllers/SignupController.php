<?php
use RT\Accounts\UserCreator;
use RT\Accounts\UserCreatorListener;
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
		return App::make('RT\Accounts\UserCreator')->
			create($this,Input::all());
	}
	public function userValidationError($errors){
		return $this->redirectBack(['errors'=>$errors]);
	}
	public function userCreated($message){
		return $this->redirectAction('AwardController@getIndex');
	}
}