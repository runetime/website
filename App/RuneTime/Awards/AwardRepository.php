<?php
namespace App\RuneTime\Awards;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class AwardRepository
 * @package App\RuneTime\Awards
 */
class AwardRepository extends EloquentRepository
{
	/**
	 * @param Award $model
	 */
	public function __construct(Award $model)
	{
		$this->model = $model;
	}

	/**
	 * @param        $status
	 * @param string $order
	 *
	 * @return mixed
	 */
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