<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\EloquentRepository;
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
		$postRepository = new PostRepository(new Post);
		$postList = [];
		$posts = \DB::table('post_thread')->
			orderBy('id', 'desc')->
			take($amount)->
			get();
		foreach($posts as $post) {
			array_push($postList, $postRepository->getById($post->post_id));
		}
		return (object) $postList;
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