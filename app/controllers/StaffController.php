<?php
use Runis\Accounts\RoleRepository;
use Runis\Accounts\UserRepository;
class StaffController extends BaseController{
	private $roles;
	private $users;
	public function __construct(RoleRepository $roles,UserRepository $users){
		$this->roles=$roles;
		$this->users=$users;
	}
	public function getIndex(){
		$this->nav('Staff Panel');
		$this->title('Staff Panel');
		$this->view('staff.index');
	}
	public function getList(){
		$admins=(array)$this->roles->getUsersById(12);
		$communityLeader=[];
		$communityLeader[0]=$this->roles->getUsersById(13);
		$communityMembers=(array)$this->roles->getUsersById(14);
		$communityTeam=array_merge($communityLeader,$communityMembers);
		$contentMembers=(array)$this->roles->getUsersById(15);
		$webDevelopers=(array)$this->roles->getUsersById(16);
		$contentTeam=array_merge($contentMembers,$webDevelopers);
		$radioLeader[0]=$this->roles->getUsersById(17);
		$radioMembers=(array)$this->roles->getUsersById(18);
		$radioTeam=array_merge($radioLeader,$radioMembers);
		$this->nav('RuneTime');
		$this->title('Staff Team');
		$this->view('staff.list',compact('admins','communityTeam','contentTeam','radioTeam'));
	}
}