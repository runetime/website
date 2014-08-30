<?php
namespace RT\Accounts;
use RT\Accounts\UserRepository;
use RT\Core\EloquentRepository;
class RoleRepository extends EloquentRepository{
	public function __construct(Role $model){
		$this->model=$model;
	}
	public function getRoleList(){
		return $this->model->
			orderBy('id','asc')->
			get();
	}
	public function getUsersById($id){
		return \DB::table('users')->
			where('role','=',$id)->
			get();
	}
}