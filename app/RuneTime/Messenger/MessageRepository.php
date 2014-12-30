<?php
namespace App\RuneTime\Messenger;

use App\RuneTime\Core\EloquentRepository;

class MessageRepository extends EloquentRepository
{
	/**
	 * @param Message $model
	 */
	public function __construct(Message $model)
	{
		$this->model = $model;
	}

	public function getByUser($userId)
	{

	}
}