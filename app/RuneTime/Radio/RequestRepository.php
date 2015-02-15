<?php
namespace App\RuneTime\Radio;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class RequestRepository
 * @package App\RuneTime\Radio
 */
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

	public function getByUserAndTime($userId, $time, $op = '>=')
	{
		return $this->model->
			where('author_id', '=', $userId)->
			where('created_at', $op, $time)->
			get();
	}
}