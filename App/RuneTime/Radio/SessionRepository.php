<?php
namespace App\RuneTime\Radio;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class SessionRepository
 * @package App\RuneTime\Radio
 */
class SessionRepository extends EloquentRepository
{
	/**
	 * @param Session $model
	 */
	public function __construct(Session $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $status
	 *
	 * @return mixed
	 */
	public function getByStatus($status)
	{
		return $this->model->
			where('status', '=', $status)->
			first();
	}
}