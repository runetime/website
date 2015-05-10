<?php
namespace App\RuneTime\Notifications;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class NotificationRepository
 * @package App\RuneTime\Notifications
 */
class NotificationRepository extends EloquentRepository
{
	/**
	 * @param Notification $model
	 */
	public function __construct(Notification $model)
	{
		$this->model = $model;
	}

	/**
	 * @param        $userId
	 * @param string $order
	 *
	 * @return mixed
	 */
	public function getAllByUser($userId, $order = 'asc')
	{
		return $this->model->
			where('user_id', '=', $userId)->
			orderBy('id', $order)->
			get();
	}

	/**
	 * @param        $userId
	 * @param int    $amount
	 * @param string $order
	 *
	 * @return mixed
	 */
	public function getXByUser($userId, $amount = 5, $order = 'asc')
	{
		return $this->model->
			where('user_id', '=', $userId)->
			orderBy('id', $order)->
			take($amount)->
			get();
	}

	/**
	 * @param        $userId
	 * @param        $statusId
	 * @param string $order
	 *
	 * @return mixed
	 */
	public function getStatusByUser($userId, $statusId, $order = 'desc')
	{
		return $this->model->
			where('user_id', '=', $userId)->
			where('status', '=', $statusId)->
			orderBy('id', $order)->
			get();
	}

	/**
	 * @param        $userId
	 * @param string $section
	 * @param int    $status
	 *
	 * @return mixed
	 */
	public function getCountByUser($userId, $section = '', $status = Notification::STATUS_UNREAD)
	{
		$query = $this->model->
			where('user_id', '=', $userId);
		if(!empty($section)) {
			$query = $query->where('section', '=', $section);
		}

		if(!empty($status)) {
			$query = $query->where('status', '=', $status);
		}

		return $query->count();
	}
}