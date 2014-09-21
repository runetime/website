<?php
namespace RT\Calculators;
use Runis\Core\Entity;
class Calculator extends Entity{
	protected $table='calculators';
	protected $fillable=[];
	protected $dates=[];
	protected $softDelete=true;
	public $presenter='RT\Calculators\CalculatorPresenter';
	const STATUS_HIDDEN=0;
	const STATUS_PUBLISHED=1;
	protected $validationRules=[
	];
}