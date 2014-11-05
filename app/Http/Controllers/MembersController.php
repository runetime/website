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
	private $perPage = 20;
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
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPage($page = 1) {
		$members = $this->users->getAll();
		$memberRoles = [];
		foreach($members as $member)
			$memberRoles[$member->id] = $this->roles->getById($member->importantRole()->id);
		$this->nav('RuneTime');
		$this->title('Members List');
		return $this->view('members.show', compact('members', 'memberRoles', 'paginator'));
	}

	/**
	 * @param $slug
	 *
	 * @return \Illuminate\View\View
	 */
	public function getSearch($slug) {
		$slugs = explode(";", $slug);
		$validParams = ['name:startsWith', 'name:endsWith', 'group'];
		$arr = [];
		foreach($slugs as $slug) {
			$slugVals = explode("=", $slug);
			if(in_array($slugVals[0], $validParams)) {
				switch($slugVals[0]) {
					case "name:startsWith":
						$arr['display_name'] = ['op' => 'LIKE', 'val' => $slugVals[1] . "%"];
						break;
				}
			}
		}
		$members = $this->users->selectArray($arr);
		$memberRoles = [];
		foreach($members as $member)
			$memberRoles[$member->id] = $this->roles->getById($member->importantRole()->id);
		$this->nav('RuneTime');
		$this->title('Members List');
		return $this->view('members.show', compact('members', 'memberRoles', 'paginator'));
	}
}