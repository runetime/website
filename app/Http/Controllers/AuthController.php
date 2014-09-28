<?php
namespace App\Http\Controllers;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
use App\Http\Requests\LoginFormRequest;
use App\Http\Requests\SignupFormRequest;
class AuthController extends BaseController{
	private $loginRequest;
	private $signupRequest;
	private $users;
	public function __construct(LoginFormRequest $loginRequest,SignupFormRequest $signupRequest,UserRepository $users){
		$this->loginRequest=$loginRequest;
		$this->signupRequest=$signupRequest;
		$this->users=$users;
	}
	public function getLoginForm(){
		$this->nav('Login');
		$this->title('Login');
		return $this->view('auth.login');
	}
	public function postLoginForm(){
		if(Input::get('email')&&Input::get('password'))
			if(Auth::attempt(['email'=>Input::get('email'),'password'=>Input::get('password')],true))
				return Redirect::action('HomeController@getIndex');
		return Redirect::action('LoginController@getForm');
	}
	public function getSignupForm(){
		$this->js('signup');
		$this->nav('Sign Up');
		$this->title('Sign Up');
		return $this->view('auth.signup');
	}
	public function postSignupForm(){
		$this->nav('Sign Up');
		$this->title('Error Signing Up');
		if(Input::get('display_name')&&Input::get('email')&&Input::get('password')&&Input::get('password2')){
			if(Input::get('password')==Input::get('password2')){
				if(!$this->users->getByDisplayName(Input::get('display_name'))){
					$user=new User;
					$user->display_name=Input::get('display_name');
					$user->email=Input::get('email');
					$user->password=Hash::make(Input::get('password'));
					$user->save();
					$user->setRole('Members');
					Auth::loginUsingId($user->id);
					return $this->redirectAction('ForumSettingsController@getIndex');
				}
				else{
					return $this->view('errors.signup.taken');
				}
			}
			else{
				return $this->view('errors.signup.passwords');
			}
		}
		else{
			return $this->view('errors.signup.input');
		}
	}
	public function getLogout(){
		Auth::logout();
		return $this->redirectAction('HomeController@getIndex');
	}
}