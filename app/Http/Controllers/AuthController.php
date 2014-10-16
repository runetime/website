<?php
namespace App\Http\Controllers;
use App\Http\Requests\LoginForm;
use App\Http\Requests\SignupForm;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
use Illuminate\Contracts\Auth\Guard;
class AuthController extends BaseController {
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param Guard          $auth
	 * @param UserRepository $users
	 */
	public function __construct(Guard $auth, UserRepository $users) {
		$this->auth = $auth;
		$this->users = $users;
	}

	/**
	 * @get("login")
	 * @return \Illuminate\View\View
	 */
	public function getLoginForm() {
		$this->nav('Login');
		$this->title('Login');
		return $this->view('auth.login');
	}

	/**
	 * @param LoginForm $form
	 * @post("login")
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postLoginForm(LoginForm $form) {
		if(!empty($this->users->getByEmail($form->input('email'))))
			if($this->auth->attempt(['email' => $form->input('email'), 'password' => $form->input('password')], true))
				return \redirect()->action('HomeController@getIndex');
		return \redirect()->action('AuthController@getLoginForm');
	}

	/**
	 * @get("signup")
	 * @return \Illuminate\View\View
	 */
	public function getSignupForm() {
		$this->js('signup');
		$this->nav('Sign Up');
		$this->title('Sign Up');
		return $this->view('auth.signup');
	}

	/**
	 * @param SignupForm $form
	 * @post("signup")
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postSignupForm(SignupForm $form) {
		$this->nav('Sign Up');
		$this->title('Error Signing Up');
		if(!$form->input('password') == $form->input('password2'))
			return $this->view('errors.signup.passwords');
		if($this->users->getByDisplayName($form->input('display_name')))
			return $this->view('errors.signup.taken');
		$user = new User;
		$user = $user->saveNew($form->input('display_name'), $form->input('email'), \Hash::make($form->input('password')));
		$user->setRole('Members');
		$this->auth->loginUsingId($user->id);
		return redirect()->action('ForumController@getIndex');
	}

	/**
	 * @get("logout")
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getLogout() {
		$this->auth->logout();
		return redirect()->action('HomeController@getIndex');
	}
}