<?php
namespace App\Http\Controllers;

use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;

class MembersController extends BaseController {
	/**
	 * @var RoleRepository
	 */
	private $roles;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param RoleRepository $roles
	 * @param UserRepository $users
	 */
	public function __construct(RoleRepository $roles, UserRepository $users) {
		$this->roles = $roles;
		$this->users = $users;
	}

	/**
	 * @param string $searchRole
	 * @param string $searchPrefix
	 * @param string $searchOrder
	 *
	 * @internal param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getIndex($searchRole = 'none', $searchPrefix = 'none', $searchOrder = 'none', $page = 1) {
		$members = $this->users->getByOptions($searchRole, $searchPrefix, $searchOrder, $page);
		$roles = $this->roles->getAll();
		$prefixes = range('a', 'z');
		$orders = ['ascending', 'descending'];
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('members.title'));
		$pages = ceil($this->users->getAmount() / User::PER_MEMBERS_PAGE);
		return $this->view('members', compact('members', 'roles', 'prefixes', 'orders', 'memberRoles', 'searchRole', 'searchPrefix', 'searchOrder', 'page', 'pages'));
	}
}