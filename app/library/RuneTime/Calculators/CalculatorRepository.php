<?php
namespace RT\Calculators;
use Runis\Core\EloquentRepository;
class CalculatorRepository extends EloquentRepository{
	public function __construct(Calculator $model){
		$this->model=$model;
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
	public function getByName($name){
		return $this->model->
			where('name','=',$name)->
			first();
	}
}