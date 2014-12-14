<?php
namespace App\Runis\Core;

use App\Runis\Core\Exceptions\NoValidationRulesFoundException;
use Illuminate\Database\Eloquent\Model;

abstract class Entity extends Model
{

	/**
	 * @param array $options
	 *
	 * @return bool
	 * @throws NoValidationRulesFoundException
	 */
	public function save(array $options = [])
	{
		return parent::save($options);
	}

	/**
	 * @return static
	 */
	public function saveNew()
	{
		return $this->create(array_combine($this->fillable, func_get_args()));
	}
}