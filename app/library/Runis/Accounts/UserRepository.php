<?php
namespace Runis\Accounts;
use Runis\Core\EloquentRepository;
use Runis\Core\Exceptions\EntityNotFoundException;
class UserRepository extends EloquentRepository{
	public function __construct(User $model){
		$this->model=$model;
	}
	public function requireByName($name){
		$model=$this->getByName($name);
		if(!$model){
			throw new EntityNotFoundException("User with name ".$name." could not be found");
		}
		return $model;
	}
	public function getByName($name){
		return $this->model->where('name','=',$name)->
			first();
	}
	public function getFirstX($count){
		return $this->model->
			take($count)->
			get();
	}
	public function getByRole($id,$op='=',$order='desc'){
		return $this->model->
			where('role',$op,$id)->
			orderBy('id',$order)->
			get();
	}
	public function getByUsername($username){
		return $this->model->
			where('username','=',$username)->
			first();
	}
	public function getByDisplayName($displayName){
		return $this->model->
			where('display_name','=',$displayName)->
			first();
	}
}