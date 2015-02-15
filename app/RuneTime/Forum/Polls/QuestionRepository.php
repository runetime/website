<?php
namespace App\RuneTime\Forum\Polls;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class QuestionRepository
 * @package App\RuneTime\Forum\Polls
 */
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