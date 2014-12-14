<?php
namespace App\RuneTime\Forum\Threads;
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

	public function getByPost($id)
	{
		return $this->model->
			where('author_id', '=', \Auth::user()->id)->
			where('post_id', '=', $id)->
			first();
	}
}