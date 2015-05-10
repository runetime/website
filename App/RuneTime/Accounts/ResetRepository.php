<?php
namespace App\RuneTime\Accounts;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class ResetRepository
 * @package App\RuneTime\Accounts
 */
class ResetRepository extends EloquentRepository
{
	/**
	 * @param Reset $model
	 */
	public function __construct(Reset $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $token
	 *
	 * @return mixed
	 */
	public function getByToken($token)
	{
		return $this->model->
			where('token', '=', $token)->
			first();
	}
}