<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\EloquentRepository;
class PostRepository extends EloquentRepository {
	/**
	 * @param Post $model
	 */
	public function __construct(Post $model) {
		$this->model=$model;
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
	 * @param     $thread
	 * @param int $amount
	 * @param int $page
	 * @param int $status
	 *
	 * @return mixed
	 */
	public function getX($thread, $amount = Thread::POSTS_PER_PAGE, $page = 1, $status = -1) {
		$res = $this->model->
			where('thread_id', '=', $thread);
		if($status > -1)
			$res = $res->where('status', '=', $status);
		return $res->
			skip(($page - 1) * Thread::POSTS_PER_PAGE)->
			take($amount)->
			orderBy('id', 'asc')->
			get();
	}
}