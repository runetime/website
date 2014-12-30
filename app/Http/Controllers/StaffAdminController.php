<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\AdminAwardAddRequest;
use App\Http\Requests\Staff\AdminIPBanRequest;
use App\Http\Requests\Staff\UserChatboxRemoveRequest;
use App\Http\Requests\Staff\UserForumPostsRequest;
use App\Http\Requests\Staff\UserSearchRequest;
use App\RuneTime\Awards\Awardee;
use App\RuneTime\Awards\AwardRepository;
use App\RuneTime\Bans\IP;
use App\RuneTime\Bans\IPRepository;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;
use App\RuneTime\Checkup\Checkup;
use App\RuneTime\Checkup\CheckupRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Accounts\RoleRepository;
use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Accounts\UserRole;
use App\RuneTime\Accounts\UserRoleRepository;

class StaffAdminController extends Controller
{
	/**
	 * @var AwardRepository
	 */
	private $awards;
	/**
	 * @var ChatRepository
	 */
	private $chatbox;
	/**
	 * @var CheckupRepository
	 */
	private $checkups;
	/**
	 * @var IPRepository
	 */
	private $ips;
	/**
	 * @var PostRepository
	 */
	private $posts;
	/**
	 * @var RoleRepository
	 */
	private $roles;
	/**
	 * @var UserRoleRepository
	 */
	private $userRoles;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param AwardRepository    $awards
	 * @param ChatRepository     $chatbox
	 * @param CheckupRepository  $checkups
	 * @param IPRepository       $ips
	 * @param PostRepository     $posts
	 * @param RoleRepository     $roles
	 * @param UserRoleRepository $userRoles
	 * @param UserRepository     $users
	 */
	public function __construct(
		AwardRepository $awards,
		ChatRepository $chatbox,
		CheckupRepository $checkups,
		IPRepository $ips,
		PostRepository $posts,
		RoleRepository $roles,
		UserRoleRepository $userRoles,
		UserRepository $users
	) {
		$this->awards = $awards;
		$this->chatbox = $chatbox;
		$this->checkups = $checkups;
		$this->ips = $ips;
		$this->posts = $posts;
		$this->roles = $roles;
		$this->userRoles = $userRoles;
		$this->users = $users;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.title');
		$this->title('staff.admin.title');

		return $this->view('staff.administrator.index');
	}

	/**
	 * @param AdminAwardAddRequest $form
	 *
	 * @return string
	 */
	public function postAward(AdminAwardAddRequest $form)
	{
		$response = ['done' => false];

		$award = $this->awards->getById($form->id);
		$user = $this->users->getByDisplayName($form->username);
		if(!empty($award) && !empty($user)) {
			$awardee = with(new Awardee)->saveNew($award->id, $user->id);
			if($awardee) {
				$response['done'] = true;
				$response['name'] = $award->name;
				$response['user'] = $user->display_name;
			}
		} else {
			$response['error'] = -1;
		}

		return json_encode($response);
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCheckupList()
	{
		return \redirect()->to('staff/administrator');

		$checkups = $this->checkups->getByStatus(Checkup::STATUS_UNCOMPLETED);

		$this->bc(['staff' => trans('staff.title'), 'staff/checkup' => trans('staff.checkup.title')]);
		$this->nav('navbar.staff.title');
		$this->title('staff.checkup.title');

		return $this->view('staff.checkup.list', compact('checkups'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getCheckupView($id)
	{
		return \redirect()->to('staff/administrator');

		$checkup = $this->checkups->getById($id);
		$displayName = $this->users->getById($checkup->author()->first()->id);
		$displayName = $displayName->display_name;

		$this->bc(['staff' => trans('staff.title'), 'staff/checkup' => trans('staff.checkup.title')]);
		$this->nav('navbar.staff.title');
		$this->title('staff.checkup.view.title', ['author' => $displayName]);

		return $this->view('staff.checkup.view', compact('checkup', 'displayName'));
	}

	/**
	 * @param AdminIPBanRequest $form
	 *
	 * @return string
	 */
	public function postIpBan(AdminIPBanRequest $form)
	{
		$response = [
			'done'       => false,
			'ip_address' => $form->ip,
		];
		$ban = with(new IP)->saveNew(\Auth::user()->id, \String::encodeIP($form->ip), $form->contents, IP::STATUS_ACTIVE);

		if(!empty($ban)) {
			$response['done'] = true;
		} else {
			$response['error'] = -1;
		}

		return json_encode($response);
	}

	/**
	 *
	 */
	public function postRadioStop()
	{
		$response = ['done' => false];

		$online = \Cache::get('radio.online');
		if($online === true) {
			\Cache::forever('radio.online', false);
		} else {
			\Cache::forever('radio.online', true);
		}

		$online = \Cache::get('radio.online');
		if($online === false) {
			$response['done'] = true;
		} else {
			$response['error'] = -1;
		}

		return json_encode($response);
	}

	/**
	 * @return string
	 */
	public function postStaffDemote()
	{
		$response = ['done' => false];
		$roles = [
			0 => [
				0 => '>=',
				1 => 2,
			],
			1 => [
				0 => '<=',
				1 => 13,
			]
		];
		$memberRoles = $this->userRoles->getByRoles($roles);
		$memberFirst = (array) $memberRoles;

		if(count($memberFirst) === 0) {
			return json_encode(['error' => -1]);
		}

		$newRole = $this->roles->getByName("Members");
		foreach($memberRoles as $memberRole) {
			$id = $memberRole->user_id;
			$memberRole->delete();
			with(new UserRole)->saveNew($id, $newRole->id, 1);
		}

		$response['done'] = true;

		return json_encode($response);
	}

	/**
	 * @param UserChatboxRemoveRequest $form
	 *
	 * @return string
	 */
	public function postUserChatboxRemove(UserChatboxRemoveRequest $form)
	{
		$response = ['done' => false];

		$user = $this->users->getByDisplayName($form->username);
		$this->chatbox->setStatusByUserId(Chat::STATUS_INVISIBLE, $user->id);

		$response['done'] = true;
		$response['name'] = $form->username;

		return json_encode($response);
	}

	/**
	 * @param UserForumPostsRequest $form
	 *
	 * @return string
	 */
	public function postUserForumPosts(UserForumPostsRequest $form)
	{
		$response = ['done' => false];

		$user = $this->users->getByDisplayName($form->username);

		$this->posts->setStatusByUser(Post::STATUS_INVISIBLE, $user->id);

		$response['done'] = true;
		$response['name'] = $form->username;

		return json_encode($response);
	}

	/**
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getUserList($page = 1)
	{
		$from = ($page - 1) * 20;
		$to = $page * 20;
		$users = $this->users->getX($from, $to);

		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title')]);
		$this->nav('navbar.staff.title');
		$this->title('staff.admin.users.title');

		return $this->view('staff.administrator.users.index', compact('users'));
	}

	/**
	 * @param UserSearchRequest $form
	 *
	 * @return string
	 */
	public function postUserSearch(UserSearchRequest $form)
	{
		$response = $this->users->getWildcardByName($form->name);

		return json_encode($response);
	}

	public function getUserView($id)
	{
		$user = $this->users->getByid($id);
		if(empty($user)) {
			return \Error::abort(404);
		}

		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title'), 'staff/administrator/users' => trans('staff.admin.users.title')]);
		$this->nav('runetime.staff.staff');
		$this->title('utilities.name', ['name' => $user->display_name]);
		return $this->view('staff.administrator.users.view', compact('user'));
	}
}