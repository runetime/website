<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\AdminIPBanRequest;
use App\RuneTime\Bans\IP;
use App\RuneTime\Bans\IPRepository;
use App\RuneTime\Checkup\Checkup;
use App\RuneTime\Checkup\CheckupRepository;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
use App\Runis\Accounts\UserRole;
use App\Runis\Accounts\UserRoleRepository;

class StaffAdminController extends BaseController
{
	/**
	 * @var CheckupRepository
	 */
	private $checkups;
	/**
	 * @var IPRepository
	 */
	private $ips;
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
	 * @param CheckupRepository  $checkups
	 * @param IPRepository       $ips
	 * @param RoleRepository     $roles
	 * @param UserRoleRepository $userRoles
	 * @param UserRepository     $users
	 */
	public function __construct(CheckupRepository $checkups, IPRepository $ips, RoleRepository $roles, UserRoleRepository $userRoles, UserRepository $users)
	{
		$this->checkups = $checkups;
		$this->ips = $ips;
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
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.title'));

		return $this->view('staff.administrator.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCheckupList()
	{
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
	public function getCheckupView($id)
	{
		$checkup = $this->checkups->getById($id);
		$displayName = $this->users->getById($checkup->author()->first()->id);
		$displayName = $displayName->display_name;

		$this->bc(['staff' => trans('staff.title'), 'staff/checkup' => trans('staff.checkup.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.checkup.view.title', ['author' => $displayName]));

		return $this->view('staff.checkup.view', compact('checkup', 'displayName'));
	}

	/**
	 * @param AdminIPBanRequest $form
	 *
	 * @return string
	 */
	public function postIPBan(AdminIPBanRequest $form)
	{
		$response = ['done' => false];
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

		\Cache::forever('radio.online', false);
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
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.users.title'));

		return $this->view('staff.administrator.users.index', compact('users'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getUserView($id)
	{
		$user = $this->users->getById($id);
		if(empty($user)) {
			return \Error::abort(404);
		}

		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('utilities.name', ['name' => $user->display_name]));

		return $this->view('staff.administrator.users.view', compact('user'));
	}
}