<?php
namespace App\Http\Controllers;
use App\Http\Requests\LoginForm;
use Illuminate\Contracts\Auth\Authenticator;
class AuthController extends BaseController{
	public function __construct(Authenticator $auth){
		$this->auth=$auth;
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
					return redirect()->action('ForumSettingsController@getIndex');
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