<?php
namespace App\RuneTime\Forum\Threads;

use App\RuneTime\Core\EloquentRepository;

class PostRepository extends EloquentRepository
{
	/**
	 * @param Post $model
	 */
	public function __construct(Post $model)
	{
		$this->model=$model;
	}

	/**
	 * @param     $thread
	 * @param int $amount
	 * @param int $page
	 * @param int $status
	 *
	 * @return mixed
	 */
	public function getX($thread, $amount = Thread::POSTS_PER_PAGE, $page = 1, $status = -1)
	{
		$res = $this->model->
			where('thread_id', '=', $thread);
		if($status > -1) {
			$res = $res->where('status', '=', $status);;
		}
		return $res->
			skip(($page - 1) * Thread::POSTS_PER_PAGE)->
			take($amount)->
			orderBy('id', 'asc')->
			get();
	}

	/**
	 * @param int $amount
	 *
	 * @return mixed
	 */
	public function getRecent($amount = 3)
	{
		return $this->model->
			where('status', '=', Post::STATUS_VISIBLE)->
			orderBy('id', 'desc')->
			take($amount)->
			get();
	}

	/**
	 * @param int $amount
	 *
	 * @return object
	 */
	public function hasThread($amount = 5)
	{
		$postList = [];
		$posts = \DB::table('post_thread')->
			orderBy('id', 'desc')->
			take($amount)->
			get();
		foreach($posts as $post) {
			array_push($postList, $this->getById($post->post_id));
		}
		return (object) $postList;
	}

	/**
	 * @param        $amount
	 * @param string $order
	 *
	 * @return array
	 */
	public function hasThreadCanView($amount, $order = 'desc')
	{
		$threads = \App::make('App\RuneTime\Forum\Threads\ThreadRepository');
		$models = \DB::table('post_thread')->
			orderBy('id', $order)->
			take($amount)->
			get();
		$modelList = [];
		$x = 0;
		foreach($models as $model) {
			$thread = $threads->getByid($model->thread_id);
			if($thread->canView()) {
				$post = $this->getByid($model->post_id);
				array_push($modelList, $post);
			} else {
				$x++;
			}
		}

		for($i = 0; $i < $x; $i++) {
			$model = \DB::table('post_thread')->
				orderBy('id', $order)->
				skip($amount)->
				take(1)->
				first();
			if(empty($model)) {
				return $modelList;
			}

			$thread = $threads->getById($model->thread_id);
			if($thread->canView()) {
				$post = $this->getById($model->post_id);
				array_push($modelList, $post);
			} else {
				$i--;
			}

			$amount++;
		}

		return $modelList;
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

	/**
	 * @param $statusId
	 * @param $userId
	 */
	public function setStatusByUser($statusId, $userId)
	{
		$this->model->
			where('author_id', '=', $userId)->
			update([
				'status' => $statusId,
			]);
	}
}