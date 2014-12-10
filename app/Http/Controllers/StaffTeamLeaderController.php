<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\LeaderUserMuteRequest;
use App\Http\Requests\Staff\LeaderUserReportRequest;

class StaffTeamLeaderController extends BaseController {
	/**
	 *
	 */
	public function __construct()
	{

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
	 * @param LeaderUserMuteRequest $form
	 *
	 * @return string
	 */
	public function postMuteUser(LeaderUserMuteRequest $form)
	{
		$response = ['muted' => false];
		return json_encode($response);
	}

	/**
	 * @param LeaderUserReportRequest $form
	 *
	 * @return string
	 */
	public function postReportUser(LeaderUserReportRequest $form)
	{
		$response = ['reported' => false];
		return json_encode($response);
	}
}