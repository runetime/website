<?php
namespace App\RuneTime\Forum\Polls;

use App\Runis\Core\EloquentRepository;

class QuestionRepository extends EloquentRepository
{
	/**
	 * @param Question $model
	 */
	public function __construct(Question $model)
	{
		$this->model = $model;
	}
}