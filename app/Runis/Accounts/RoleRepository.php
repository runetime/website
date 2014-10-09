<?php
namespace App\Runis\Accounts;
use App\Runis\Core\EloquentRepository;
use App\Runis\Accounts\UserRepository;
class RoleRepository extends EloquentRepository{
	private $users;
	public function __construct(Role $model){
		$this->model=$model;
		$this->users=\App::make('App\Runis\Accounts\UserRepository');
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
		$q->orderBy('role_id','asc');
		$q->orderBy('user_id','asc');
		$q=$q->get();
		$list = [];
		foreach($q as $item)
			array_push($list, $item);
		return $list;
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