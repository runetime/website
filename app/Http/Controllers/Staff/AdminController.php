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
		$this->bc(['staff' => 'Staff']);
		$this->nav('navbar.staff.staff');
		$this->title('Administrator Panel');
		return $this->view('staff.administrator.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorUsers() {
		$this->bc(['staff' => 'Staff', 'staff/administrator' => 'Administrator Panel']);
		$this->nav('navbar.staff.staff');
		$this->title('User Management');
		return $this->view('staff.administrator.users');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorIPBan() {
		$addresses = $this->ips->getByStatus(IP::STATUS_ACTIVE);
		$this->bc(['staff' => 'Staff', 'staff/administrator' => 'Administrator Panel']);
		$this->nav('navbar.staff.staff');
		$this->title('IP Banning');
		return $this->view('staff.administrator.ip', compact('addresses'));
	}

	/**
	 * @param IPBanRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postAdministratorIPBan(IPBanRequest $form) {
		$IPBan = new IP;
		$IPBan->saveNew(\Auth::user()->id, \String::encodeIP($form->ip), $form->contents, IP::STATUS_ACTIVE);
		return \redirect()->to('staff/administrator/ip-ban');
	}
}