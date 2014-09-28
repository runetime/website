<?php
namespace App\Runis\Accounts;
use App\Runis\Core\EloquentRepository;
use App\Runis\Core\Exceptions\EntityNotFoundException;
class UserRepository extends EloquentRepository{
	public function __construct(User $model){
		$this->model=$model;
	}
	public function getTotal(){
		return $this->model->count();
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
	public function getX($from,$to){
		return $this->model->
			take($to)->
			skip($from)->
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
	public function getByEmail($email){
		return $this->model->
			where('email','=',$email)->
			first();
	}
	public function selectArray(array $selections){
		$q=$this->model;
		foreach($selections as $key=>$selection)
			$q=$q->where($key,$selection['op'],$selection['val']);
		return $q->get();
	}
}