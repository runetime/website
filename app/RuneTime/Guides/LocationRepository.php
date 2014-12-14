<?php
namespace App\RuneTime\Guides;

use App\Runis\Core\EloquentRepository;

class LocationRepository extends EloquentRepository
{
	/**
	 * @param Location $model
	 */
	public function __construct(Location $model)
	{
		$this->model = $model;
	}

	/**
	 * @return mixed
	 */
	public function getAll()
	{
		return $this->model->
		get();
	}
}