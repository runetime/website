<?php
namespace RT\Statuses;
use Runis\Core\EloquentRepository;
class StatusRepository extends EloquentRepository{
	public function __construct(Status $model){
		$this->model=$model;
	}
	public function getRecentStatuses($count=5){
		return $this->model->
			where('status','=',Status::STATUS_PUBLISHED)->
			orderBy('published_at','desc')->
			take($count)->
			get();
	}
}