<?php
use Runis\Accounts\User;
use Runis\Accounts\UserRepository;
class AuthController extends BaseController{
	private $users;
	public function __construct(UserRepository $users){
		$this->users=$users;
	}
	public function getLoginForm(){
		$this->nav('Login');
		$this->title('Login');
		$this->view('auth.login');
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
		$this->view('auth.signup');
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
	public function getLogout(){
		Auth::logout();
		return $this->redirectAction('HomeController@getIndex');
	}
}