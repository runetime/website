<?php
namespace App\Http\Controllers;
use App\Http\Requests\LoginForm;
use App\Http\Requests\SignupForm;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
use Illuminate\Contracts\Auth\Authenticator;
class AuthController extends BaseController{
	public function __construct(Authenticator $auth,UserRepository $users){
		$this->auth=$auth;
		$this->users=$users;
	}
	public function getLoginForm(){
		$nav='Login';
		$title='Login';
		$view=view('auth.login',compact('nav','title'));
		return $view;
	}
	public function postLoginForm(LoginForm $form){
		if($form->input('email')&&$form->input('password'))
			if($this->auth->attempt(['email'=>$form->input('email'),'password'=>$form->input('password')],true))
				return redirect()->action('HomeController@getIndex');
		return redirect()->action('LoginController@getLoginForm');
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
		if($form->input('display_name')&&$form->input('email')&&$form->input('password')&&$form->input('password2')){
			if($form->input('password')==$form->input('password2')){
				if(!$this->users->getByDisplayName($form->input('display_name'))){
					$user=new User;
					$user->display_name=$form->input('display_name');
					$user->email=$form->input('email');
					$user->password=\Hash::make($form->input('password'));
					$user->save();
					$user->setRole('Members');
					$this->auth->loginUsingId($user->id);
					return redirect()->action('ForumController@getIndex');
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
		$this->auth->logout();
		return redirect()->action('HomeController@getIndex');
	}
}