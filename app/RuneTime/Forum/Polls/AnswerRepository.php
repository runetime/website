<?php
namespace App\RuneTime\Forum\Polls;

use App\RuneTime\Core\EloquentRepository;

class AnswerRepository extends EloquentRepository
{
	/**
	 * @param Answer $model
	 */
	public function __construct(Answer $model)
	{
		$this->model = $model;
	}
}