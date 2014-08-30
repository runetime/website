<?php
namespace RT\Accounts;
use RT\Core\EloquentRepository;
use RT\Core\Exceptions\EntityNotFoundException;
class UserRepository extends EloquentRepository{
	public function __construct(User $model){
		$this->model=$model;
	}
	public function getByName($name){
		return $this->model->
			where('name','=',$name)->
			first();
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
}