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
	 * @return array
	 */
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