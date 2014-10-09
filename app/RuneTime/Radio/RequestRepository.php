<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\EloquentRepository;
class RequestRepository extends EloquentRepository{
	public function __construct(Request $model){
		$this->model=$model;
	}
//	public function getBySession(){
//		return $this->model->
//			where('session','=',$this->getLatest()->id)->
//			get();
//	}
//	public function getLatest(){
//		return $this->model->
//			orderBy('id','desc')->
//			first();
//	}
}