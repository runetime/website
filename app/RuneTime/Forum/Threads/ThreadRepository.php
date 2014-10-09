<?php
namespace App\RuneTime\Forum\Threads;
use App\RuneTime\Forum\Subforums\Subforum;
use App\Runis\Core\EloquentRepository;
class ThreadRepository extends EloquentRepository{
	public function __construct(Thread $model){
		$this->model=$model;
	}
	public function getBySubforum($subforumId, $page=1) {
		return $this->model->
			where('subforum', '=', $subforumId)->
			skip(($page - 1) * Subforum::THREADS_PER_PAGE)->
			take(Subforum::THREADS_PER_PAGE)->
			get();
	}
	public function getCountInSubforum($subforumId) {
		return $this->model->
			where('subforum', '=', $subforumId)->
			get()->
			count();
	}
}