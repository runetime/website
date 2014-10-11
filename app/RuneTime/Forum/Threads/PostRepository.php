<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\EloquentRepository;
class PostRepository extends EloquentRepository{
	public function __construct(Post $model){
		$this->model=$model;
	}
	public function getX($thread, $amount = Thread::POSTS_PER_PAGE, $page = 1, $order='asc') {
		return $this->model->
			where('thread', '=', $thread)->
			skip(($page - 1) * Thread::POSTS_PER_PAGE)->
			take($amount)->
			orderBy('id', $order)->
			get();
	}
}