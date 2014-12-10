<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\AdminChatboxClearRequest;
use App\Http\Requests\Staff\AdminDemoteAllStaffRequest;
use App\Http\Requests\Staff\AdminIPBanRequest;
use App\Http\Requests\Staff\AdminRadioStopRequest;
use App\Http\Requests\Staff\AdminUserChangeRequest;
use App\Http\Requests\Staff\AdminUserChatboxDeleteRequest;
use App\Http\Requests\Staff\AdminUserPostsDeleteRequest;
use App\Http\Requests\Staff\AdminUserWarningRequest;
use App\RuneTime\Bans\IP;
use App\RuneTime\Bans\IPRepository;
use App\RuneTime\Checkup\Checkup;
use App\RuneTime\Checkup\CheckupRepository;
use App\Runis\Accounts\UserRepository;

class StaffAdminController extends BaseController {
	/**
	 * @var CheckupRepository
	 */
	private $checkups;
	/**
	 * @var IPRepository
	 */
	private $ips;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param CheckupRepository $checkups
	 * @param IPRepository      $ips
	 * @param UserRepository    $users
	 */
	public function __construct(CheckupRepository $checkups, IPRepository $ips, UserRepository $users) {
		$this->checkups = $checkups;
		$this->ips = $ips;
		$this->users = $users;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.title'));
		return $this->view('staff.administrator.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCheckupList() {
		$checkups = $this->checkups->getByStatus(Checkup::STATUS_UNCOMPLETED);
		$this->bc(['staff' => trans('staff.title'), 'staff/checkup' => trans('staff.checkup.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.checkup.title'));
		return $this->view('staff.checkup.list', compact('checkups'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getCheckupView($id) {
		$checkup = $this->checkups->getById($id);
		$displayName = $this->users->getById($checkup->author()->first()->id);
		$displayName = $displayName->display_name;
		$this->bc(['staff' => trans('staff.title'), 'staff/checkup' => trans('staff.checkup.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.checkup.view.title', ['author' => $displayName]));
		return $this->view('staff.checkup.view', compact('checkup', 'displayName'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getUserList($page = 1) {
		$from = ($page - 1) * 20;
		$to = $page * 20;
		$users = $this->users->getX($from, $to);
		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.users.title'));
		return $this->view('staff.administrator.users.index', compact('users'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getUserView($id) {
		$user = $this->users->getById($id);
		if(empty($user))
			return \Error::abort(404);
		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('utilities.name', ['name' => $user->display_name]));
		return $this->view('staff.administrator.users.view', compact('user'));
	}

	/**
	 * @param AdminUserChangeRequest $form
	 *
	 * @return string
	 */
	public function postUserChange(AdminUserChangeRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @param AdminUserChatboxDeleteRequest $form
	 *
	 * @return string
	 */
	public function postUserChatboxDelete(AdminUserChatboxDeleteRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @param AdminUserPostsDeleteRequest $form
	 *
	 * @return string
	 */
	public function postUserPostsDelete(AdminUserPostsDeleteRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @param AdminUserWarningRequest $form
	 *
	 * @return string
	 */
	public function postUserWarning(AdminUserWarningRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @param AdminRadioStopRequest $form
	 *
	 * @return string
	 */
	public function postRadioStop(AdminRadioStopRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @param AdminDemoteAllStaffRequest $form
	 *
	 * @return string
	 */
	public function postDemoteAllStaff(AdminDemoteAllStaffRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @param AdminChatboxClearRequest $form
	 *
	 * @return string
	 */
	public function postChatboxClear(AdminChatboxClearRequest $form) {
		$response = ['done' => true];
		return json_encode($response);
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIPBan() {
		$addresses = $this->ips->getByStatus(IP::STATUS_ACTIVE);
		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.ip.title'));
		return $this->view('staff.administrator.ip', compact('addresses'));
	}

	/**
	 * @param AdminIPBanRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postIPBan(AdminIPBanRequest $form) {
		with(new IP)->saveNew(\Auth::user()->id, \String::encodeIP($form->ip), $form->contents, IP::STATUS_ACTIVE);
		return \redirect()->to('staff/administrator/ip-ban');
	}
}