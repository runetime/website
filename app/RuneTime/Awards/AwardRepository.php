<?php
namespace App\RuneTime\Awards;

use App\RuneTime\Core\EloquentRepository;

class AwardRepository extends EloquentRepository
{
	/**
	 * @param Award $model
	 */
	public function __construct(Award $model)
	{
		$this->model = $model;
	}

	public function getByStatus($status, $order = 'asc')
	{
		return $this->model->
			where('status', '=', $status)->
			orderBy('id', $order)->
			get();
	}

	/**
	 * @param $slug
	 *
	 * @return mixed
	 */
	public function getBySlug($slug)
	{
		return $this->model->
			where('id',explode("-",$slug)[0])->
			first();
	}
}