<?php
namespace App\RuneTime\Radio;

use App\Runis\Core\EloquentRepository;

class RequestRepository extends EloquentRepository
{
	/**
	 * @param Request $model
	 */
	public function __construct(Request $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getByUser($id)
	{
		return $this->model->
			where('author_id', '=', $id)->
			get();
	}

	/**
	 * @param $since
	 *
	 * @return mixed
	 */
	public function getByTime($since)
	{
		return $this->model->
			where('created_at', '>=', $since)->
			get();
	}
}