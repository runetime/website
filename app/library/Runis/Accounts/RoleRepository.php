<?php
namespace Runis\Accounts;
use Runis\Accounts\UserRepository;
use Runis\Core\EloquentRepository;
class RoleRepository extends EloquentRepository{
	private $users;
	public function __construct(Role $model){
		$this->model=$model;
		$this->users=\App::make('Runis\Accounts\UserRepository');
	}
	public function getRoleList(){
		return $this->model->
			orderBy('id','asc')->
			get();
	}
	public function getUsersById(){
		$q=\DB::table('role_user');
		$roles=func_get_args();
		foreach($roles as $x=>$role){
			if($x==0)
				$q->where('role_id','=',$role);
			else
				$q->orWhere('role_id','=',$role);
		}
		$q=$q->get();
		$users=[];
		foreach($q as $user)
			$users[].=$this->users->getById($user->user_id);
		return $users;
	}
	public function getByName($roleName){
		return $this->model->
			where('name','=',$roleName)->
			first();
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
}