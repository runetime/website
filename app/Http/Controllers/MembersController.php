<?php
namespace App\Http\Controllers;

use App\RuneTime\Accounts\RoleRepository;
use App\RuneTime\Accounts\User;
use App\RuneTime\Accounts\UserRepository;

/**
 * Class MembersController
 */
final class MembersController extends Controller
{
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
    public function __construct(RoleRepository $roles, UserRepository $users)
    {
        $this->roles = $roles;
        $this->users = $users;
    }

    /**
     * @param string $searchRole
     * @param string $searchPrefix
     * @param string $searchOrder
     * @param int    $page
     *
     * @return \Illuminate\View\View
     */
    public function getIndex($searchRole = 'none', $searchPrefix = 'none', $searchOrder = 'none', $page = 1)
    {
        $members = $this->users->getByOptions($searchRole, $searchPrefix, $searchOrder, $page);
        $roles = $this->roles->getAll();
        $prefixes = range('a', 'z');
        $orders = ['ascending', 'descending'];
        $pages = ceil($this->users->getAmount() / User::PER_MEMBERS_PAGE);

        $this->nav('navbar.runetime.title');
        $this->title('members.title');

        return $this->view('members', compact('members', 'roles', 'prefixes', 'orders', 'memberRoles', 'searchRole', 'searchPrefix', 'searchOrder', 'page', 'pages'));
    }
}
