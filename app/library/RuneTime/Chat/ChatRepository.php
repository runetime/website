<?php
namespace RT\Chat;
use Runis\Core\EloquentRepository;
class ChatRepository extends EloquentRepository{
	public function __construct(Chat $model){
		$this->model=$model;
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
	public function getX($amount){
		return $this->model->
			take($amount)->
			get();
	}
}