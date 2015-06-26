<?php
namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\PasswordEmailRequest;
use App\Http\Requests\Auth\PasswordResetRequest;
use App\Http\Requests\Auth\SignupRequest;
use App\RuneTime\Accounts\RankRepository;
use App\RuneTime\Accounts\ResetRepository;
use App\RuneTime\Accounts\RoleRepository;
use App\RuneTime\Accounts\User;
use App\RuneTime\Accounts\UserRepository;
use Illuminate\Contracts\Auth\PasswordBroker;

/**
 * Class AuthController
 */
class AuthController extends Controller
{
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
     * @var RoleRepository
     */
    private $roles;
    /**
     * @var UserRepository
     */
    private $users;

    /**
     * @param PasswordBroker  $passwords
     * @param RankRepository  $ranks
     * @param ResetRepository $resets
     * @param RoleRepository  $roles
     * @param UserRepository  $users
     */
    public function __construct(PasswordBroker $passwords, RankRepository $ranks, ResetRepository $resets, RoleRepository $roles, UserRepository $users)
    {
        $this->passwords = $passwords;
        $this->ranks = $ranks;
        $this->resets = $resets;
        $this->roles = $roles;
        $this->users = $users;
    }

    /**
     * Returns the Login page, and if the user had failed to
     * login then it also displays the appropriate error.
     *
     * @return \Illuminate\View\View
     */
    public function getLoginForm()
    {
        $incorrect = \Session::pull('login.incorrect');

        $this->nav('navbar.logged.out.login');
        $this->title('navbar.logged.out.login');

        return $this->view('auth.login', compact('incorrect'));
    }

    /**
     * Checks if the user's login credentials are correct.
     * If they are correct then it logs them into their
     * account, and if not, it redirects them to the
     * login page with a translated error message.
     *
     * @param LoginRequest $form
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function postLoginForm(LoginRequest $form)
    {
        $user = $this->users->getByEmail($form->email);

        if (!empty($user)) {
            // The account exists
            $credentials = [
                'email'    => $form->email,
                'password' => $form->password,
            ];

            // Check if the user's credentials are correct
            if (\Auth::attempt($credentials, true)) {
                return \redirect()->to('/');
            }
        }

        // Supply the user with an error message
        \Session::put('login.incorrect', true);

        return \redirect()->to('login');
    }

    /**
     * Returns the Signup page
     *
     * @return \Illuminate\View\View
     */
    public function getSignupForm()
    {
        $this->nav('navbar.logged.out.signup');
        $this->title('navbar.logged.out.signup');

        return $this->view('auth.signup');
    }

    /**
     * Checks if the user's credentials are appropriate, and
     * if so - and there is not an account with the email
     * address and/or username - it creates their new
     * account and signs the user into the account.
     *
     * @param SignupRequest $form
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function postSignupForm(SignupRequest $form)
    {
        // Check if the two given passwords match
        if ($form->password !== $form->password2) {
            return $this->view('errors.signup.passwords');
        }

        // Check if the display name has been taken
        if ($this->users->getByDisplayName($form->display_name)) {
            return $this->view('errors.signup.taken');
        }

        $hash = \Hash::make($form->password);
        $rank = $this->ranks->getByPostCount(0);

        // The list of columns of what this is, is in the User model
        $user = with(new User)->saveNew(
            '',
            '',
            0,
            0,
            0,
            $form->display_name,
            1,
            $form->email,
            0,
            time(),
            $hash,
            0,
            0,
            0,
            '',
            '',
            '',
            '',
            '',
            $rank->id,
            -1,
            0,
            '',
            '',
            '',
            '',
            '',
            '',
            0,
            ''
        );
        $role = $this->roles->getByName('Members');
        $user->roleAdd($role, true);

        // Logs the user into their new account.
        \Auth::loginUsingId($user->id, true);

        $data = [
            'id'   => $user->id,
            'name' => $user->display_name,
        ];

        // Mails the user about their new account.
        \Mail::send('emails.auth.register', $data, function ($message) use ($user) {
            $message->to($user->email);
            $message->subject(trans('auth.register.email.subject'));
        });

        return \redirect()->to('/');
    }

    /**
     * Logs the user out of their account and
     * redirects the user to the homepage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function getLogout()
    {
        \Auth::logout();

        return redirect()->to('/');
    }

    /**
     * Returns the password reset page.
     *
     * @return \Illuminate\View\View
     */
    public function getPasswordEmail()
    {
        $this->nav('navbar.logged.out.login');
        $this->title('auth.reset.title');

        return $this->view('auth.password.email');
    }

    /**
     * Emails the user a link to reset their password.
     *
     * @param PasswordEmailRequest $request
     *
     * @return \Illuminate\Http\RedirectResponse|int
     */
    public function postPasswordEmail(PasswordEmailRequest $request)
    {
        $response = $this->passwords->sendResetLink($request->get('email'));

        switch ($response) {
            case PasswordBroker::INVALID_USER:
                return redirect()->back()->with('error', trans($response));

                break;
            case PasswordBroker::RESET_LINK_SENT:
                return redirect()->back()->with('status', trans($response));

                break;
        }

        return 1;
    }

    /**
     * Allows the user to reset their password if they have
     * an appropriate reset token that was emailed to
     * them after filling out the password reset.
     *
     * @param $token
     *
     * @return \Illuminate\View\View
     */
    public function getPasswordReset($token)
    {
        $reset = $this->resets->getByToken($token);

        if (empty($reset)) {
            return \Error::abort(404);
        }

        $this->nav('navbar.logged.out.login');
        $this->title('auth.reset.title');

        return $this->view('auth.password.reset', compact('reset'));
    }

    /**
     * This resets the user's password to the one
     * they chose if they used a valid token.
     *
     * @param                      $token
     * @param PasswordResetRequest $form
     *
     * @return \Illuminate\Http\RedirectResponse|int
     */
    public function postPasswordReset($token, PasswordResetRequest $form)
    {
        $reset = $this->resets->getByToken($token);

        if (!$reset) {
            return \Error::abort(404);
        }

        $user = $this->users->getByEmail($reset->email);

        if (!empty($user)) {
            $user->password = \Hash::make($form->password);
            $user->save();

            \Auth::logout();
            \Auth::loginUsingId($user->id);

            return redirect()->to('/');
        }

        return 1;
    }

    /**
     * Redirects the user to the login form.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function getRedirect()
    {
        return redirect()->to('login');
    }
}
