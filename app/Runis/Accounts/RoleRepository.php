<?php
namespace App\Runis\Accounts;
use App\Runis\Core\EloquentRepository;
class RoleRepository extends EloquentRepository{
	private $users;

	/**
	 * @param Role $model
	 */
	public function __construct(Role $model){
		$this->model=$model;
		$this->users=\App::make('App\Runis\Accounts\UserRepository');
	}

	/**
	 * @return mixed
	 */
	public function getRoleList(){
		return $this->model->
			orderBy('id','asc')->
			get();
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getUsersById($id){
		return $this->model->
			where('id', '=', $id)->
			first()->users;
	}

	/**
	 * @param $roleName
	 *
	 * @return mixed
	 */
	public function getByName($roleName){
		return $this->model->
			where('name','=',$roleName)->
			first();
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
}