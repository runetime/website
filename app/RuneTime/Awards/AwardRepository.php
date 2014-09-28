<?php
namespace App\RuneTime\Awards;
use App\Runis\Core\EloquentRepository;
use App\Runis\Accounts\User;
class AwardRepository extends EloquentRepository{
	public function __construct(Award $model){
		$this->model=$model;
	}
	public function getAllAwards(){
		return $this->model->
			orderBy('name','asc')->
			get();
	}
	public function getBySlug($slug){
		return $this->model->
			where('id',explode("-",$slug)[0])->
			first();
	}
	public function getAwardees($id){
		return (new User())->
			where('awards','LIKE','%,'.$id.',')->
			orWhere('awards','LIKE',$id.',%')->
			orWhere('awards','LIKE',$id)->
			get();
	}
}