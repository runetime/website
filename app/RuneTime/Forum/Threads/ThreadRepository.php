<?php
namespace App\RuneTime\Forum\Threads;
use App\RuneTime\Forum\Subforums\Subforum;
use App\Runis\Core\EloquentRepository;
class ThreadRepository extends EloquentRepository
{
	/**
	 * @param Thread $model
	 */
	public function __construct(Thread $model)
	{
		$this->model = $model;
	}

	/**
	 * @param        $subforumId
	 * @param int    $page
	 * @param string $orderBy
	 * @param bool   $pinned
	 *
	 * @return mixed
	 */
	public function getBySubforum($subforumId, $page=1, $orderBy = 'last_post', $pinned = false)
	{
		$q = $this->model->
			where('subforum_id', '=', $subforumId);
		if($pinned) {
			$q = $q->where(function($query) {
				$query->where('status', '=', 2)->
				orWhere('status', '=', 3)->
				orWhere('status', '=', 6)->
				orWhere('status', '=', 7);
			});
		} else {
			$q = $q->where(function($query) {
				$query->where('status', '=', 0)->
				orWhere('status', '=', 1)->
				orWhere('status', '=', 4)->
				orWhere('status', '=', 5);
			});
		}
		$q = $q->
			orderBy($orderBy, 'desc')->
			skip(($page-1)*Subforum::THREADS_PER_PAGE)->
			take(Subforum::THREADS_PER_PAGE)->
			get();
		return $q;
	}

	/**
	 * @param $subforumId
	 *
	 * @return mixed
	 */
	public function getCountInSubforum($subforumId)
	{
		return $this->model->
			where('subforum', '=', $subforumId)->
			orderBy('last_post', 'desc')->
			get()->
			count();
	}

	/**
	 * @param        $amount
	 * @param string $order
	 *
	 * @return mixed
	 */
	public function getX($amount, $order='desc')
	{
		return $this->model->
			orderBy('id', $order)->
			take($amount)->
			get();
	}

	/**
	 * @param int $page
	 *
	 * @return \stdClass
	 */
	public function getByPage($page = 1)
	{
		$results = new \stdClass;
		$results->page = $page;
		$results->limit = Subforum::THREADS_PER_PAGE;
		$results->totalItems = 0;
		$results->items = [];

		$users = $this->model->skip(Subforum::THREADS_PER_PAGE * ($page - 1))->take(Subforum::THREADS_PER_PAGE)->get();

		$results->totalItems = $this->model->count();
		$results->items = $users->all();

		return $results;
	}

	/**
	 * @param     $userId
	 * @param int $amount
	 *
	 * @return mixed
	 */
	public function getLatestByUser($userId, $amount = 5)
	{
		return $this->model->
			where('author_id', '=', $userId)->
			orderBy('id', 'desc')->
			take($amount)->
			get();
	}
}