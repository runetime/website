<?php
namespace App\Runis\Core;

use Illuminate\Database\Eloquent\Model;

abstract class Entity extends Model
{

	/**
	 * @param array $options
	 *
	 * @return bool
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