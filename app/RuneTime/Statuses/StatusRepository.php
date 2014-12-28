<?php
namespace App\RuneTime\Statuses;

use App\Runis\Core\EloquentRepository;

class StatusRepository extends EloquentRepository
{
	/**
	 * @param Status $model
	 */
	public function __construct(Status $model)
	{
		$this->model = $model;
	}

	/**
	 * @param int    $count
	 * @param string $op
	 * @param int    $status
	 *
	 * @return mixed
	 */
	public function getLatest($count = 5, $op = '=', $status = Status::STATUS_PUBLISHED)
	{
		return $this->model->
			where('status', $op, $status)->
			orderBy('created_at', 'desc')->
			take($count)->
			get();
	}

	/**
	 * @param        $authorId
	 * @param int    $amount
	 * @param string $order
	 *
	 * @return mixed
	 */
	public function getByAuthor($authorId, $amount = 1, $order = 'desc')
	{
		return $this->model->
			where('author_id', '=', $authorId)->
			orderBy('id', $order)->
			take($amount)->
			get();
	}

	/**
	 * @param        $authorId
	 * @param string $order
	 *
	 * @return mixed
	 */
	public function getLatestByAuthor($authorId, $order = 'desc')
	{
		return $this->model->
			where('author_id', '=', $authorId)->
			orderBy('id', $order)->
			first();
	}
}