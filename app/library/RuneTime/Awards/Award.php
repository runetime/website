<?php
namespace RT\Awards;
use Runis\Core\Entity;
class Award extends Entity{
	protected $table     ='awards';
	protected $with      =[];
	protected $fillable  =['name','name_trim','description','given','last_awarded'];
	protected $dates     =[];
	protected $softDelete=true;
	public $presenter='RT\Awards\AwardPresenter';
	const STATUS_UNAVAILABLE=0;
	const STATUS_AVAILABLE  =1;
	protected $validationRules=[
		'name'        =>'required',
		'name_trim'   =>'required',
		'description' =>'required',
		'given'       =>'required',
		'last_awarded'=>'required'
	];
	public static function makeSlug($id,$name=""){
		if(empty($name)){
			$name=$this->model->
				where('id',$id)->
				first()->name;
		}
		$name=strtolower($name);
		$name=str_replace(" ","-",str_replace("_","-",$name));
		return $id."-".$name;
	}
}
