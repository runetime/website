<?php
namespace App\RuneTime\Forum\Polls;

use App\RuneTime\Core\EloquentRepository;

class PollRepository extends EloquentRepository
{
	/**
	 * @param Poll $model
	 */
	public function __construct(Poll $model)
	{
		$this->model = $model;
	}
}