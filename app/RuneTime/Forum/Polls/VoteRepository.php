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

	/**
	 * @param $authorId
	 * @param $questionId
	 *
	 * @return mixed
	 */
	public function getByData($authorId, $questionId)
	{
		return $this->model->
			where('author_id', '=', $authorId)->
			where('question_id', '=', $questionId)->
			first();
	}

	public function getByAllData($authorId, $answerId, $questionId)
	{
		return $this->model->
			where('author_id', '=', $authorId)->
			where('answer_id', '=', $answerId)->
			where('question_id', '=', $questionId)->
			first();
	}
}