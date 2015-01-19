<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\EloquentRepository;

class FilterRepository extends EloquentRepository
{
	/**
	 * @param Filter $model
	 */
	public function __construct(Filter $model)
	{
		$this->model = $model;
	}
}