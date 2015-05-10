<?php
namespace App\RuneTime\Calculators;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class CalculatorRepository
 * @package App\RuneTime\Calculators
 */
class CalculatorRepository extends EloquentRepository
{
	/**
	 * @param \App\RuneTime\Calculators\Calculator $model
	 */
	public function __construct(Calculator $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $name
	 *
	 * @return mixed
	 */
	public function getByName($name)
	{
		return $this->model->
			where('name', '=', $name)->
			first();
	}

	/**
	 * @param $nameTrim
	 *
	 * @return mixed
	 */
	public function getByNameTrim($nameTrim)
	{
		return $this->model->
			where('name_trim', '=', $nameTrim)->
			first();
	}
}