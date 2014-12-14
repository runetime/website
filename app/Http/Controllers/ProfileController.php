<?php
namespace App\Http\Controllers;

use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Statuses\StatusRepository;
use App\Runis\Accounts\UserRepository;

class ProfileController extends BaseController
{
	/**
	 * @var PostRepository
	 */
	private $posts;
	/**
	 * @var StatusRepository
	 */
	private $statuses;
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
	 * @param StatusRepository $statuses
	 * @param ThreadRepository $threads
	 * @param UserRepository   $users
	 */
	public function __construct(PostRepository $posts, StatusRepository $statuses, ThreadRepository $threads, UserRepository $users)
	{
		$this->posts = $posts;
		$this->statuses = $statuses;
		$this->threads = $threads;
		$this->users = $users;
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getProfileIndex($id)
	{
		$profile = $this->users->getById($id);
		if(!$profile) {
			\App::abort(404);
		}

		$profile->incrementProfileViews();
		$status = $this->statuses->getLatestByAuthor($profile->id);

		$this->bc(['forums/' => trans('forums.name')]);
		$this->nav('navbar.forums');
		$this->title(trans('profile.title', ['name' => $profile->display_name]));
		return $this->view('forums.profile.index', compact('profile', 'status'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getProfileFeed($id)
	{
		$profile = $this->users->getById($id);
		if(!$profile) {
			\App::abort(404);
		}

		$profile->incrementProfileViews();
		$threads = $this->threads->getLatestByUser($id, 5);
		$status = $this->statuses->getLatestByAuthor($profile->id);

		$this->bc(['forums/' => trans('forums.title'), 'profile/' . \String::slugEncode($profile->id, $profile->display_name) => $profile->display_name]);
		$this->nav('navbar.forums');
		$this->title(trans('profile.feed.title', ['name' => $profile->display_name]));
		return $this->view('forums.profile.feed', compact('profile', 'status', 'threads'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getProfileFriends($id)
	{
		$profile = $this->users->getById($id);
		if(!$profile) {
			\App::abort(404);
		}

		$profile->incrementProfileViews();
		$status = $this->statuses->getLatestByAuthor($profile->id);

		$this->bc(['forums/' => 'Forums', 'profile/' . \String::slugEncode($profile->id, $profile->display_name) => $profile->display_name]);
		$this->nav('navbar.forums');
		$this->title($profile->display_name . "'s Friends");
		return $this->view('forums.profile.friends', compact('profile', 'status'));
	}
}
