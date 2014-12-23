<?php
namespace App\RuneTime\Forum\Polls;

use App\Runis\Core\EloquentRepository;

class VoteRepository extends EloquentRepository
{
	/**
	 * @param Vote $model
	 */
	public function __construct(Vote $model)
	{
		$this->model = $model;
	}
}