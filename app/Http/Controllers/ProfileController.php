<?php namespace App\Http\Controllers;
use App\RuneTime\Statuses\StatusRepository;
use App\Runis\Accounts\UserRepository;
class ProfileController extends BaseController {
	/**
	 * @var UserRepository
	 */
	private $users;
	/**
	 * @var StatusRepository
	 */
	private $statuses;

	/**
	 * @param StatusRepository $statuses
	 * @param UserRepository   $users
	 */
	public function __construct(StatusRepository $statuses, UserRepository $users) {
		$this->users = $users;
		$this->statuses = $statuses;
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getProfileIndex($id) {
		$profile = $this->users->getById($id);
		if(!$profile)
			\App::abort(404);
		$profile->incrementProfileViews();
		$latestStatus = $this->statuses->getByAuthor($profile->id);
		$bc = ['forums/' => 'Forums'];
		$this->bc($bc);
		$this->nav('navbar.forums');
		$this->title($profile->display_name);
		return $this->view('forums.profile.index', compact('profile', 'latestStatus'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getProfileFeed() {
		$this->nav('navbar.forums');
		return $this->view('forums.profile.index', compact('profile', 'latestStatus'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getProfileFriends() {
		$this->nav('navbar.forums');
		return $this->view('forums.profile.index', compact('profile', 'latestStatus'));
	}
}
