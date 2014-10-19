<?php namespace App\Runis\Core;
use Validator,App;
use App\Runis\Core\Exceptions\NoValidationRulesFoundException;
class FormModel{
    protected $inputData;
    protected $validationRules;
    protected $validator;

	/**
	 *
	 */
	public function __construct() {
        $this->inputData = App::make('request')->all();
    }

	/**
	 * @return mixed
	 */
	public function getInputData() {
        return $this->inputData;
    }

	/**
	 * @return bool
	 * @throws NoValidationRulesFoundException
	 */
	public function isValid() {
        $this->beforeValidation();
        if(!isset($this->validationRules))
            throw new NoValidationRulesFoundException('no validation rules found in class '.get_called_class());
        $this->validator = Validator::make($this->getInputData(), $this->getPreparedRules());
        return $this->validator->passes();
    }

	/**
	 * @return mixed
	 */
	public function getErrors() {
        return $this->validator->errors();
    }

	/**
	 * @return mixed
	 */
	protected function getPreparedRules() {
        return $this->validationRules;
    }

	/**
	 *
	 */
	protected function beforeValidation() {
	}
}