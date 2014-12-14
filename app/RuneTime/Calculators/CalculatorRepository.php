<?php
namespace App\RuneTime\Calculators;
use App\Runis\Core\EloquentRepository;
class CalculatorRepository extends EloquentRepository
{
	public function __construct(Calculator $model)
	{
		$this->model = $model;
	}

	public function getByName($name)
	{
		return $this->model->
			where('name', '=', $name)->
			first();
	}

	public function getByNameTrim($nameTrim)
	{
		return $this->model->
			where('name_trim', '=', $nameTrim)->
			first();
	}
}