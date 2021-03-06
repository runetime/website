<?php
namespace App\Http\Controllers;

use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use Illuminate\View\View;

/**
 * Class ProfileController
 */
final class ProfileController extends Controller
{
    /**
     * @var PostRepository
     */
    private $posts;
    /**
     * @var ThreadRepository
     */
    private $threads;
    /**
     * @var UserRepository
     */
    private $users;

    /**
     * @param PostRepository   $posts
     * @param ThreadRepository $threads
     * @param UserRepository   $users
     */
    public function __construct(
        PostRepository $posts,
        ThreadRepository $threads,
        UserRepository $users
    ) {
        $this->posts = $posts;
        $this->threads = $threads;
        $this->users = $users;
    }

    /**
     * @param $id
     *
     * @return View
     */
    public function getProfileIndex($id)
    {
        $profile = $this->users->getById($id);
        if (empty($profile)) {
            return \Error::abort(404);
        }

        $profile->incrementProfileViews();

        $birthday = '';
        if ($profile->birthday_day) {
            $birthday .= \Time::day($profile->birthday_day) . ' ';
        }

        if ($profile->birthday_month) {
            if ($birthday) {
                $birthday .= \Time::month($profile->birthday_month, true);
            } else {
                $birthday .= \Time::month($profile->birthday_month);
            }
        }

        if ($profile->birthday_year) {
            if ($birthday) {
                $birthday .= \Time::year($profile->birthday_year, true);
            } else {
                $birthday .= \Time::year($profile->birthday_year);
            }
        }

        $this->bc(['forums/' => trans('forums.title')]);
        $this->nav('navbar.forums');
        $this->title('utilities.name', ['name' => $profile->display_name]);

        return $this->view('forums.profile.index', compact('profile', 'birthday'));
    }

    /**
     * @param $id
     *
     * @return View
     */
    public function getProfileAwards($id)
    {
        $profile = $this->users->getbyId($id);
        if (empty($profile)) {
            return \Error::abort(404);
        }

        $awards = $profile->awards;

        $this->bc(['forums/' => trans('forums.title'), 'profile/' . \String::slugEncode($profile->id, $profile->display_name) => $profile->display_name]);
        $this->nav('navbar.forums');
        $this->title('profile.awards.title', ['name' => $profile->display_name]);

        return $this->view('forums.profile.awards', compact('profile', 'awards'));
    }

    /**
     * @param $id
     *
     * @return View
     */
    public function getProfileFeed($id)
    {
        $profile = $this->users->getById($id);
        if (empty($profile)) {
            return \Error::abort(404);
        }

        $profile->incrementProfileViews();
        $threads = $this->threads->getLatestByUser($id, 5);

        $this->bc(['forums/' => trans('forums.title'), 'profile/' . \String::slugEncode($profile->id, $profile->display_name) => $profile->display_name]);
        $this->nav('navbar.forums');
        $this->title('profile.feed.title', ['name' => $profile->display_name]);

        return $this->view('forums.profile.feed', compact('profile', 'threads'));
    }
}
