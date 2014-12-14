<?php
namespace App\RuneTime\Radio;

use App\Runis\Core\EloquentRepository;

class MessageRepository extends EloquentRepository
{
	/**
	 * @param Message $model
	 */
	public function __construct(Message $model)
	{
		$this->model = $model;
	}

	public function getByUser($id)
	{
		return $this->model->
			where('author_id', '=', $id)->
			get();
	}
}