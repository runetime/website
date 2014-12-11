<?php
namespace App\Runis\Accounts;

use App\Runis\Core\EloquentRepository;

class UserRoleRepository extends EloquentRepository{
	/**
	 * @param UserRole $model
	 */
	public function __construct(UserRole $model) {
		$this->model = $model;
	}

	public function getImportantByUser($id) {
		return $this->model->
			where('user_id', '=', $id)->
			where('important', '=', 1)->
			first();
	}

	public function getByRole($id) {
		return $this->model->
			where('role_id', '=', $id)->
			get();
	}

	public function selectByUserAndRole($userId, $roleId) {
		return $this->model->
			where('user_id', '=', $userId)->
			where('role_id', '=', $roleId)->
			first();
	}
}