<?php
namespace App\Http\Controllers;
use App\Http\Requests\Staff\IPBanRequest;
use App\RuneTime\Bans\IP;
use App\RuneTime\Bans\IPRepository;
class StaffAdminController extends BaseController {
	/**
	 * @var IPRepository
	 */
	private $ips;

	/**
	 * @param IPRepository $ips
	 */
	public function __construct(IPRepository $ips) {
		$this->ips = $ips;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorIndex() {
		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.title'));
		return $this->view('staff.administrator.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorUsers() {
		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.users.title'));
		return $this->view('staff.administrator.users');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorIPBan() {
		$addresses = $this->ips->getByStatus(IP::STATUS_ACTIVE);
		$this->bc(['staff' => trans('staff.title'), 'staff/administrator' => trans('staff.admin.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('staff.admin.ip.title'));
		return $this->view('staff.administrator.ip', compact('addresses'));
	}

	/**
	 * @param IPBanRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postAdministratorIPBan(IPBanRequest $form) {
		with(new IP)->saveNew(\Auth::user()->id, \String::encodeIP($form->ip), $form->contents, IP::STATUS_ACTIVE);
		return \redirect()->to('staff/administrator/ip-ban');
	}
}