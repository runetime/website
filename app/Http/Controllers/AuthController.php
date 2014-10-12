<?php
namespace App\Http\Controllers;
use App\Http\Requests\LoginForm;
use App\Http\Requests\SignupForm;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
use Illuminate\Contracts\Auth\Authenticator;
class AuthController extends BaseController{
	public function __construct(Authenticator $auth, UserRepository $users) {
		$this->auth = $auth;
		$this->users = $users;
	}
	public function getLoginForm(){
		$this->nav('Login');
		$this->title('Login');
		return $this->view('auth.login');
	}
	public function postLoginForm(LoginForm $form){
		if(!empty($this->users->getByEmail($form->input('email'))))
			if($this->auth->attempt(['email' => $form->input('email'), 'password' => $form->input('password')], true))
				return \redirect()->action('HomeController@getIndex');
		return \redirect()->action('AuthController@getLoginForm');
	}
	public function getSignupForm(){
		$this->js('signup');
		$this->nav('Sign Up');
		$this->title('Sign Up');
		return $this->view('auth.signup');
	}
	public function postSignupForm(SignupForm $form){
		$this->nav('Sign Up');
		$this->title('Error Signing Up');
		if(!$form->input('password') == $form->input('password2'))
			return $this->view('errors.signup.passwords');
		if($this->users->getByDisplayName($form->input('display_name')))
			return $this->view('errors.signup.taken');
		$user=new User;
		$user = $user->saveNew($form->input('display_name'), $form->input('email'), \Hash::make($form->input('password')));
		$user->setRole('Members');
		$this->auth->loginUsingId($user->id);
		return redirect()->action('ForumController@getIndex');
	}
	public function getLogout(){
		$this->auth->logout();
		return redirect()->action('HomeController@getIndex');
	}
}