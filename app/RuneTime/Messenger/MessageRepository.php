<?php
namespace App\RuneTime\Messenger;
use App\Runis\Core\EloquentRepository;
/**
 * Class MessageRepository
 */
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