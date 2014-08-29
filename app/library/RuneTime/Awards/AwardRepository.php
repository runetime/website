<?php
namespace RT\Awards;
use RT\Core\EloquentRepository;
class AwardRepository extends EloquentRepository{
	public function __construct(Award $model){
		$this->model=$model;
	}
	public function getRecentAwards($count=3){
		return $this->model->
			where('status','=',Award::STATUS_AVAILABLE)->
			orderBy('published_at','desc')->
			take($count)->
			get();
	}
}
