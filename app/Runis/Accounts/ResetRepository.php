<?php
namespace App\Runis\Accounts;

use App\Runis\Core\EloquentRepository;

class ResetRepository extends EloquentRepository {
	/**
	 * @param Reset $model
	 */
	public function __construct(Reset $model) {
		$this->model = $model;
	}

	public function getByToken($token) {
		return $this->model->
			where('token', '=', $token)->
			first();
	}
}