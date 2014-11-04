<?php
namespace App\RuneTime\Messenger;
use App\Runis\Core\EloquentRepository;
/**
 * Class MessageRepository
 */
class MessageRepository extends EloquentRepository {
	/**
	 * @param Message $model
	 */
	public function __construct(Message $model) {
		$this->model = $model;
	}

	/**
	 * @param $messageId
	 *
	 * @internal param $threadId
	 *
	 * @return mixed
	 */
	public function getById($messageId) {
		return $this->model->
		where('id', '=', $messageId)->
		first();
	}

	public function getByUser($userId) {

	}
}