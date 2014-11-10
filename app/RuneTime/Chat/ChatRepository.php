<?php
namespace App\RuneTime\Chat;
use App\Runis\Core\EloquentRepository;
class ChatRepository extends EloquentRepository {
	/**
	 * @param Chat $model
	 */
	public function __construct(Chat $model) {
		$this->model = $model;
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getById($id) {
		return $this->model->
			where('id', '=', $id)->
			first();
	}

	/**
	 * @param $amount
	 *
	 * @return mixed
	 */
	public function getX($amount) {
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
	public function getByCreatedAt($time) {
		return $this->model->
			where('created_at', '>', $time)->
			get();
	}

	/**
	 * @param $channelId
	 * @param $amount
	 *
	 * @return mixed
	 */
	public function getByChannel($channelId, $amount) {
		return $this->model->
			where('channel', '=', $channelId)->
			orderBy('id', 'desc')->
			take($amount)->
			get();
	}

	/**
	 * @param $channelId
	 *
	 * @return mixed
	 */
	public function getLatestByChannel($channelId) {
		return $this->model->
			where('channel', '=', $channelId)->
			orderBy('id', 'desc')->
			first();
	}
}