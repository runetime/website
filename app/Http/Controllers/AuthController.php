<?php
namespace App\Http\Controllers;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\SignupRequest;
use App\Http\Requests\Auth\PasswordEmailRequest;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\PasswordBroker;
/**
 * Class AuthController
 * @package App\Http\Controllers
 */
class AuthController extends BaseController {
	/**
	 * @var UserRepository
	 */
	private $users;
	/**
	 * @var PasswordBroker
	 */
	private $passwords;

	/**
	 * @param Guard          $auth
	 * @param PasswordBroker $passwords
	 * @param UserRepository $users
	 */
	public function __construct(Guard $auth, PasswordBroker $passwords, UserRepository $users) {
		$this->auth = $auth;
		$this->users = $users;
		$this->passwords = $passwords;
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

	/**
	 * @return \Illuminate\View\View
	 */
	public function getPasswordEmail() {
		$this->nav('navbar.login');
		$this->title('Password Reset');
		return $this->view('auth.password.email');
	}

	/**
	 * @param PasswordEmailRequest $request
	 *
	 * @return \Illuminate\Http\RedirectResponse|int
	 */
	public function postPasswordEmail(PasswordEmailRequest $request) {
		switch ($response = $this->passwords->sendResetLink($request->only('email')))
		{
			case PasswordBroker::INVALID_USER:
				return redirect()->back()->with('error', trans($response));

			case PasswordBroker::RESET_LINK_SENT:
				return redirect()->back()->with('status', trans($response));
		}
		return 1;
	}
}