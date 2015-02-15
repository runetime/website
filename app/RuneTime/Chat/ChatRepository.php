<?php
namespace App\RuneTime\Chat;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class ChatRepository
 * @package App\RuneTime\Chat
 */
class ChatRepository extends EloquentRepository
{
	/**
	 * @param Chat $model
	 */
	public function __construct(Chat $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $amount
	 *
	 * @return mixed
	 */
	public function getX($amount)
	{
		return $this->model->
			orderBy('id', 'desc')->
			take($amount)->
			get();
	}

	/**
	 * @param $time
	 *
	 * @return mixed
	 */
	public function getByCreatedAt($time)
	{
		return $this->model->
			where('created_at', '>', $time)->
			get();
	}

	/**
	 * @param        $channelId
	 * @param        $amount
	 * @param int    $status
	 * @param string $op
	 *
	 * @return mixed
	 */
	public function getByChannel($channelId, $amount, $status = Chat::STATUS_VISIBLE, $op = '=')
	{
		return $this->model->
			where('channel', '=', $channelId)->
			where('status', $op, $status)->
			orderBy('id', 'desc')->
			take($amount)->
			get();
	}

	public function getLatest()
	{
		return $this->model->
			orderBy('id', 'desc')->
			first();
	}

	/**
	 * @param $channelId
	 *
	 * @return mixed
	 */
	public function getLatestByChannel($channelId)
	{
		return $this->model->
			where('channel', '=', $channelId)->
			orderBy('id', 'desc')->
			first();
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getAfterId($id)
	{
		$message = $this->model->
			where('id', '=', $id)->
			first();

		return $this->model->
			where('id', '>', $id)->
			where('channel', '=', $message->channel)->
			get();
	}

	/**
	 * @param        $id
	 * @param int    $status
	 * @param string $op
	 *
	 * @return mixed
	 */
	public function getAfterIdByStatus($id, $status = Chat::STATUS_VISIBLE, $op = '=')
	{
		$message = $this->model->
			where('id', '=', $id)->
			first();

		return $this->model->
			where('id', '>', $id)->
			where('channel', '=', $message->channel)->
			where('status', $op, $status)->
			get();
	}

	/**
	 * @param bool $actuallyDo
	 */
	public function setAllInvisible($actuallyDo = false)
	{
		if($actuallyDo === true) {
			$this->model->update([
				'status' => Chat::STATUS_INVISIBLE
			]);
		}
	}

	/**
	 * @param $statusId
	 * @param $userId
	 */
	public function setStatusByUserId($statusId, $userId)
	{
		$this->model->
			where('author_id', '=', $userId)->
			update([
				'status' => $statusId,
			]);
	}

	/**
	 * @param        $status
	 * @param string $op
	 *
	 * @return mixed
	 */
	public function getByStatus($status, $op = '=')
	{
		return $this->model->
			where('status', $op, $status)->
			orderBy('created_at', 'desc')->
			get();
	}
}