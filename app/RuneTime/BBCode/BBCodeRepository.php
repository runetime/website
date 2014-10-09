<?php
namespace App\RuneTime\BBCode;
use App\Runis\Core\EloquentRepository;
class BBCodeRepository extends EloquentRepository{
	public function __construct(BBCode $model){
		$this->model=$model;
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
	public function getAll(){
		if(!isset($this->all))
			$this->all=$this->model->get();
		return $this->all;
	}
	public function parse($str){
		if(!isset($this->getAll))
			$this->getAll();
		foreach($this->all as $bbcode)
			$str=preg_replace($bbcode->parse_from,$bbcode->parse_to,$str);
		return $str;
	}
}