<?php
namespace App\Http\Controllers;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\SignupRequest;
use App\Http\Requests\Auth\PasswordEmailRequest;
use App\Http\Requests\Auth\PasswordResetRequest;
use App\Runis\Accounts\RankRepository;
use App\Runis\Accounts\ResetRepository;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
use Illuminate\Contracts\Auth\PasswordBroker;
/**
 * Class AuthController
 * @package App\Http\Controllers
 */
class AuthController extends BaseController {
	/**
	 * @var PasswordBroker
	 */
	private $passwords;
	/**
	 * @var RankRepository
	 */
	private $ranks;
	/**
	 * @var ResetRepository
	 */
	private $resets;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param PasswordBroker  $passwords
	 * @param RankRepository  $ranks
	 * @param ResetRepository $resets
	 * @param UserRepository  $users
	 */
	public function __construct(PasswordBroker $passwords, RankRepository $ranks, ResetRepository $resets, UserRepository $users) {
		$this->passwords = $passwords;
		$this->ranks = $ranks;
		$this->resets = $resets;
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
		$user = $this->users->getByEmail($form->email);
		if($user)
			if(\Auth::attempt(['email' => $form->email, 'password' => $form->password], true))
				return \redirect()->to('/');
		return \redirect()->to('login');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getSignupForm() {
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
		if(!$form->password == $form->password2)
			return $this->view('errors.signup.passwords');
		if($this->users->getByDisplayName($form->display_name))
			return $this->view('errors.signup.taken');
		$hash = \Hash::make($form->password);
		$rank = $this->ranks->getByPostCount(0);
		$user = with(new User)->saveNew($form->display_name, $form->email, $hash, '', '', '', '', '', 0, 0, 0, -1, 0, -1, 0, 1, 0, $rank->id, '', '', '', '', '', '', '', '', '', '', '');
		$user->setRole('Members');
		\Auth::loginUsingId($user->id);
		return \redirect()->to('/');
	}

	/**
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getLogout() {
		\Auth::logout();
		return redirect()->to('/');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getPasswordEmail() {
		$this->nav('navbar.login');
		$this->title(trans('auth.reset.title'));
		return $this->view('auth.password.email');
	}

	/**
	 * @param PasswordEmailRequest $request
	 *
	 * @return \Illuminate\Http\RedirectResponse|int
	 */
	public function postPasswordEmail(PasswordEmailRequest $request) {
		switch ($response = $this->passwords->sendResetLink($request->only('email'))) {
			case PasswordBroker::INVALID_USER:
				return redirect()->back()->with('error', trans($response));
			case PasswordBroker::RESET_LINK_SENT:
				return redirect()->back()->with('status', trans($response));
		}
		return 1;
	}

	/**
	 * @param $token
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPasswordReset($token) {
		$reset = $this->resets->getByToken($token);
		if(!$reset)
			\App::abort(404);
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('auth.reset.title'));
		return $this->view('auth.password.reset', compact('reset'));
	}

	/**
	 * @param PasswordResetRequest $form
	 *
	 * @return mixed
	 */
	public function postPasswordReset($token, PasswordResetRequest $form) {
		$reset = $this->resets->getByToken($token);
		if(!$reset)
			\App::abort(404);
		$user = $this->users->getByEmail($reset->email);
		if($user) {
			$user->password = \Hash::make($form->password);
			$user->save();
			\Auth::logout();
			\Auth::loginUsingId($user->id);
			return \redirect()->to('/');
		}
		return 1;
	}
}