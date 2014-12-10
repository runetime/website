<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\LeaderClearChatboxRequest;
use App\Http\Requests\Staff\LeaderDemoteStaffRequest;
use App\Http\Requests\Staff\LeaderMuteUserRequest;
use App\Http\Requests\Staff\LeaderTempBanRequest;
use App\Runis\Accounts\UserRepository;

class StaffTeamLeaderController extends BaseController {
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 *
	 */
	public function __construct(UserRepository $users)
	{
		$this->users = $users;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.team_leader');
		$this->title(trans('staff.team_leader.title'));
		return $this->view('staff.team_leader.index');
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