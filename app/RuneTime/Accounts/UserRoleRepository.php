<?php
namespace App\RuneTime\Accounts;

use App\RuneTime\Core\EloquentRepository;

class UserRoleRepository extends EloquentRepository
{
	/**
	 * @param UserRole $model
	 */
	public function __construct(UserRole $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getImportantByUser($id)
	{
		return $this->model->
			where('user_id', '=', $id)->
			where('important', '=', 1)->
			first();
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getByRole($id)
	{
		return $this->model->
			where('role_id', '=', $id)->
			get();
	}

	/**
	 * @param $userId
	 * @param $roleId
	 *
	 * @return mixed
	 */
	public function selectByUserAndRole($userId, $roleId)
	{
		return $this->model->
			where('user_id', '=', $userId)->
			where('role_id', '=', $roleId)->
			first();
	}

	/**
	 * @param $roles
	 *
	 * @return mixed
	 */
	public function getByRoles($roles)
	{
		$q = $this->model;

		foreach($roles as $role) {
			$q = $q->where('role_id',
				$role[0],
				$role[1]);
		}

		return $q->get();
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getByUser($id)
	{
		return $this->model->
			where('user_id', '=', $id)->
			get();
	}
}