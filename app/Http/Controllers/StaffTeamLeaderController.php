<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\LeaderClearChatboxRequest;
use App\Http\Requests\Staff\LeaderDemoteStaffRequest;
use App\Http\Requests\Staff\LeaderMuteUserRequest;
use App\Http\Requests\Staff\LeaderTempBanRequest;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
use App\Runis\Accounts\UserRoleRepository;
class StaffTeamLeaderController extends BaseController {
	/**
	 * @var UserRepository
	 */
	private $users;
	/**
	 * @var UserRoleRepository
	 */
	private $userRoles;
	/**
	 * @var ChatRepository
	 */
	private $chats;
	/**
	 * @var RoleRepository
	 */
	private $roles;

	/**
	 * @param ChatRepository     $chats
	 * @param RoleRepository     $roles
	 * @param UserRepository     $users
	 * @param UserRoleRepository $userRoles
	 */
	public function __construct(ChatRepository $chats, RoleRepository $roles, UserRepository $users, UserRoleRepository $userRoles)
	{
		$this->users = $users;
		$this->userRoles = $userRoles;
		$this->chats = $chats;
		$this->roles = $roles;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.team_leader');
		$this->title(trans('staff.team_leader.title'));
		$roleId = \Auth::user()->importantRole()->id + 1;
		$members = $this->userRoles->getByRole($roleId);
		return $this->view('staff.team_leader.index', compact('members'));
	}

	/**
	 * @param LeaderDemoteStaffRequest $form
	 *
	 * @return string
	 */
	public function postDemote(LeaderDemoteStaffRequest $form)
	{
		$response = ['done' => false];
		$user = $this->users->getById($form->id);
		if(\Auth::user()->isLeader()) {
			if($user->importantRole()->id - 1 === \Auth::user()->importantRole()->id) {
				$newRole = $this->roles->getByName("Members");
				$user->roleRemove($user->importantRole());
				$user->roleAdd($newRole, true);
				$response['done'] = true;
				$response['name'] = $user->display_name;
			} else {
				$response['error'] = -2;
			}
		} else {
			$response['error'] = -1;
		}
		return json_encode($response);
	}

	/**
	 * @param LeaderTempBanRequest $form
	 *
	 * @return string
	 */
	public function postTempBan(LeaderTempBanRequest $form)
	{
		$response = ['done' => false];
		return json_encode($response);
	}

	/**
	 * @param LeaderMuteUserRequest $form
	 *
	 * @return string
	 */
	public function postMuteUser(LeaderMuteUserRequest $form)
	{
		$response = ['done' => false];
		return json_encode($response);
	}

	/**
	 * @param LeaderClearChatboxRequest $form
	 *
	 * @return string
	 */
	public function postClearChatbox(LeaderClearChatboxRequest $form)
	{
		$response = ['done' => false];
		$this->chats->setAllInvisible(true);
		$chat = $this->chats->getLatest();
		if($chat->status === Chat::STATUS_INVISIBLE)
			$response['done'] = true;
		else
			$response['error'] = -1;
		return json_encode($response);
	}
}