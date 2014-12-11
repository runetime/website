<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\LeaderClearChatboxRequest;
use App\Http\Requests\Staff\LeaderDemoteStaffRequest;
use App\Http\Requests\Staff\LeaderMuteUserRequest;
use App\Http\Requests\Staff\LeaderTempBanRequest;
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
	 * @param UserRepository     $users
	 * @param UserRoleRepository $userRoles
	 */
	public function __construct(UserRepository $users, UserRoleRepository $userRoles)
	{
		$this->users = $users;
		$this->userRoles = $userRoles;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.team_leader');
		$this->title(trans('staff.team_leader.title'));
		$members = $this->userRoles->getByRole(\Auth::user()->importantRole()->id - 1);
		return $this->view('staff.team_leader.index', compact('members'));
	}

	/**
	 * @param LeaderDemoteStaffRequest $form
	 *
	 * @return string
	 */public function postDemoteStaff(LeaderDemoteStaffRequest $form)
	{
		$response = ['done' => false];
		$user = $this->users->getById($form->id);
		if(\Auth::user()->isLeader()) {
			if($user->importantRole()->id -1 === \Auth::user()->importantRole()->id) {
				$user->removeRole($user->importantRole());
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
	 */public function postTempBan(LeaderTempBanRequest $form)
	{
		$response = ['done' => false];
		return json_encode($response);
	}

	/**
	 * @param LeaderMuteUserRequest $form
	 *
	 * @return string
	 */public function postMuteUser(LeaderMuteUserRequest $form)
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
		return json_encode($response);

	}
}