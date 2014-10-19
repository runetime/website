<?php
namespace App\Runis\Core;
use App\Runis\Core\Exceptions\NoValidationRulesFoundException;
use App\Runis\Core\Exceptions\NoValidatorInstantiatedException;
use Illuminate\Database\Eloquent\Model;
use Validator;
abstract class Entity extends Model {
	protected $validationRules = [];
	protected $validator;

	/**
	 * @return bool
	 * @throws NoValidationRulesFoundException
	 */
	public function isValid() {
		if(!isset($this->validationRules))
			throw new NoValidationRulesFoundException('No validation rule array defined in class'.get_called_class());
		$this->validator = Validator::make($this->getAttributes(), $this->getPreparedRules());
		return $this->validator->passes();
	}

	/**
	 * @return mixed
	 * @throws NoValidatorInstantiatedException
	 */
	public function getErrors() {
		if(!$this->validator)
			throw new NoValidatorInstantiatedException;
		return $this->validator->errors();
	}

	/**
	 * @param array $options
	 *
	 * @return bool
	 * @throws NoValidationRulesFoundException
	 */
	public function save(array $options = []) {
		if(!$this->isValid())
			return false;
		return parent::save($options);
	}

	/**
	 * @return array
	 */
	protected function getPreparedRules() {
		return $this->replaceIdsIfExists($this->validationRules);
	}

	/**
	 * @param $rules
	 *
	 * @return array
	 */
	protected function replaceIdsIfExists($rules) {
		$newRules = [];
		foreach($rules as $key => $rule) {
			if(str_contains($rule, '<id>')) {
				$replacement = $this->exists ? $this->getAttribute($this->primaryKey) : '';
				$rule = str_replace('<id>', $replacement, $rule);
			}
			array_set($newRules, $key, $rule);
		}
		return $newRules;
	}

	/**
	 * @return static
	 */
	public function saveNew() {
		return $this->create(array_combine($this->fillable, func_get_args()));
	}
}