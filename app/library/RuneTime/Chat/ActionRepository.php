<?php
namespace RT\Chat;
use Runis\Core\EloquentRepository;
class ActionRepository extends EloquentRepository{
	public function __construct(Action $model){
		$this->model=$model;
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
//	public function getSince($time){
//		return $this->model->
//			
//	}
}