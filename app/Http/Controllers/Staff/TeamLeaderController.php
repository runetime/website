<?php
namespace App\Http\Controllers;

class TeamLeaderController extends BaseController {
	public function __construct()
	{

	}

	public function getIndex()
	{
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.team_leader');
		$this->title(trans('staff.team_leader.title'));
		return $this->view('staff.team_leader.index');
	}
}