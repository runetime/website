<?php
namespace App\RuneTime\Forum\Threads;
use App\RuneTime\Forum\Subforums\Subforum;
use App\Runis\Core\EloquentRepository;
class ThreadRepository extends EloquentRepository{
	public function __construct(Thread $model){
		$this->model=$model;
	}
	public function getBySubforum($subforumId, $page=1, $orderBy = 'last_post', $order = 'desc') {
		return $this->model->
			where('subforum', '=', $subforumId)->
			orderBy($orderBy, $order)->
			skip(($page-1)*Subforum::THREADS_PER_PAGE)->
			take(Subforum::THREADS_PER_PAGE)->
			get();
	}
	public function getCountInSubforum($subforumId) {
		return $this->model->
			where('subforum', '=', $subforumId)->
			orderBy('last_post', 'desc')->
			get()->
			count();
	}
	public function getX($amount,$order='desc'){
		return $this->model->
			orderBy('id',$order)->
			take($amount)->
			get();
	}
	public function getByPage($page = 1) {
		$results = new \stdClass;
		$results->page = $page;
		$results->limit = Subforum::THREADS_PER_PAGE;
		$results->totalItems = 0;
		$results->items = array();

		$users = $this->model->skip(Subforum::THREADS_PER_PAGE * ($page - 1))->take(Subforum::THREADS_PER_PAGE)->get();

		$results->totalItems = $this->model->count();
		$results->items = $users->all();

		return $results;
	}
}