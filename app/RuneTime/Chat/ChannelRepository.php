<?php
namespace App\RuneTime\Chat;
use App\Runis\Core\EloquentRepository;
class ChannelRepository extends EloquentRepository{
	public function __construct(Channel $model){
		$this->model=$model;
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
	public function getAll(){
		return $this->model->
			orderBy('messages','asc')->
			get();
	}
	public function getByName($name){
		return $this->model->
			where('name','=',$name)->
			first();
	}
	public function getByNameTrim($nameTrim){
		return $this->model->
			where('name_trim','=',$nameTrim)->
			first();
	}
}