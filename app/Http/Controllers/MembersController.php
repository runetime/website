<?php
namespace App\Http\Controllers;
namespace App\Http\Controllers;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
/**
 * Class MembersController
 * @package App\Http\Controllers
 */
class MembersController extends BaseController {
	private $roles;
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
	public function getPage($searchRole = 'none', $searchPrefix = 'none', $searchOrder = 'none') {
		$members = $this->users->getByOptions($searchRole, $searchPrefix, $searchOrder);
		$roles = $this->roles->getAll();
		$prefixes = range('a', 'z');
		$orders = ['ascending', 'descending'];
		$this->nav('RuneTime');
		$this->title('Members List');
		return $this->view('members.show', compact('members', 'roles', 'prefixes', 'orders', 'memberRoles', 'searchRole', 'searchPrefix', 'searchOrder'));
	}
}