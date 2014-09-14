<?php
namespace RT\News;
use Runis\Core\EloquentRepository;
class NewsRepository extends EloquentRepository{
	public function __construct(News $model){
		$this->model=$model;
	}
	public function getRecentNews($count=3){
		return $this->model->
			where('status','=',News::STATUS_PUBLISHED)->
			orderBy('published_at','desc')->
			take($count)->
			get();
	}
}