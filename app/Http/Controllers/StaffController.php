<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\CheckupRequest;
use App\Http\Requests\Staff\UserMuteRequest;
use App\Http\Requests\Staff\UserReportRequest;
use App\RuneTime\Checkup\CheckupRepository;
use App\RuneTime\Checkup\Checkup;
use App\Runis\Accounts\RoleRepository;

class StaffController extends BaseController {
	/**
	 * @var CheckupRepository
	 */
	private $checkups;
	/**
	 * @var RoleRepository
	 */
	private $roles;

	/**
	 * @param CheckupRepository $checkups
	 * @param RoleRepository    $roles
	 */
	public function __construct(CheckupRepository $checkups, RoleRepository $roles) {
		$this->checkups = $checkups;
		$this->roles = $roles;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.index.title'));
		return $this->view('staff.index');
	}

	/**
	 * @param UserReportRequest $form
	 *
	 * @return string
	 */
	public function postUserReport(UserReportRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @param UserMuteRequest $form
	 *
	 * @return string
	 */
	public function postUserMute(UserMuteRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCheckup() {
		$date = \Time::long(\Carbon::now());
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.checkup.title'));
		return $this->view('staff.checkup.form', compact('date'));
	}

	/**
	 * @param CheckupRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCheckup(CheckupRequest $form) {
		$hoursActive = with(new \Parsedown)->text($form->hours_active);
		$checkup = with(new Checkup)->saveNew($form->active, $hoursActive, $form->team);
		$checkup->addAuthor(\Auth::user());
		return \redirect()->to('staff');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getList() {
		$admins = $this->roles->getUsersById(1);
		$radio = $this->roles->getUsersById(2, 3);
		$media = $this->roles->getUsersById(4, 5);
		$webDev = $this->roles->getUsersById(6, 7);
		$content = $this->roles->getUsersById(8, 9);
		$community = $this->roles->getUsersById(10, 11);
		$events = $this->roles->getUsersById(12, 13);
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('staff.list.title'));
		return $this->view('staff.list', compact('admins', 'radio', 'media', 'webDev', 'content', 'community', 'events'));
	}
}