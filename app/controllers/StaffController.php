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
		$admins=(array)$this->roles->getUsersById(1);
		$radio=$this->roles->getUsersById(2,3);
		$media=$this->roles->getUsersById(4,5);
		$webDev=$this->roles->getUsersById(6,7);
		$content=$this->roles->getUsersById(8,9);
		$community=$this->roles->getUsersById(10,11);
		$events=$this->roles->getUsersById(12,13);
		$this->nav('RuneTime');
		$this->title('Staff Team');
		$this->view('staff.list',compact('admins','radio','media','webDev','content','content','community','events'));
	}
}