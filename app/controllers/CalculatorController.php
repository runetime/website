<?php
use RT\Calculators\CalculatorRepository;
class CalculatorController extends BaseController{
	private $calculators;
	public function __construct(CalculatorRepository $calculators){
		$this->calculators=$calculators;
	}
	public function getIndex(){

	}
	public function getView($type){

	}
}
