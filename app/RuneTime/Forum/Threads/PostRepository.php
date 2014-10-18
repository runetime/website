<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\EloquentRepository;
class PostRepository extends EloquentRepository{
	public function __construct(Post $model){
		$this->model=$model;
	}
	public function getX($thread, $amount = Thread::POSTS_PER_PAGE, $page = 1, $status = -1) {
		$res = $this->model->
			where('thread', '=', $thread);
		if($status > -1)
			$res = $res->where('status', '=', $status);
		return $res->
			skip(($page - 1) * Thread::POSTS_PER_PAGE)->
			take($amount)->
			orderBy('id', 'asc')->
			get();
	}
}