<?php
namespace RT\Core;
use Validator,Eloquent;
use RT\Core\Exceptions\NoValidationRulesFoundException;
use RT\Core\Exceptions\NoValidatorInstantiatedException;
abstract class Entity extends Eloquent{
	protected $validationRules=[];
	protected $validator;
	public function isValid(){
		if(!isset($this->validationRules)){
			throw new NoValidationRulesFoundException('No validation rule array defined in class'.get_called_class());
		}
		$this->validator=Validator::make($this->getAttributes(),$this->getPreparedRules());
		return $this->validator->passes();
	}
	public function getErrors(){
		if(!$this->validator){
			throw new NoValidatorInstantiatedException;
		}
		return $this->validator->errors();
	}
	protected function getPreparedRules(){
		return $this->replaceIdsIfExists($this->validationRules);
	}
	protected function replaceIdsIfExists($rules){
		$newRules=[];
		foreach($rules as $key=>$rule){
			if(str_contains($rule,'<id>')){
				$replacement=$this->exists?$this->getAttribute($this->primaryKey):'';
				$rule=str_replace('<id>',$replacement,$rule);
			}
			array_set($newRules,$key,$rule);
		}
		return $newRules;
	}
}