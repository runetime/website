<?php
namespace App\Http\Controllers;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\SignupRequest;
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
	 * @return \Illuminate\View\View
	 */
	public function getLoginForm() {
		$this->nav('navbar.logged.out.login');
		$this->title(trans('navbar.logged.out.login'));
		return $this->view('auth.login');
	}

	/**
	 * @param LoginRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postLoginForm(LoginRequest $form) {
		if(!empty($this->users->getByEmail($form->input('email'))))
			if($this->auth->attempt(['email' => $form->input('email'), 'password' => $form->input('password')], true))
				return \redirect()->to('/');
		return \redirect()->action('AuthController@getLoginForm');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getSignupForm() {
		$this->js('signup');
		$this->nav('navbar.logged.out.signup');
		$this->title(trans('navbar.logged.out.signup'));
		return $this->view('auth.signup');
	}

	/**
	 * @param SignupRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postSignupForm(SignupRequest $form) {
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
		return \redirect()->to('/');
	}

	/**
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getLogout() {
		$this->auth->logout();
		return redirect()->to('/');
	}
}