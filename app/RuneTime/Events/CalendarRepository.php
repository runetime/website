<?php
namespace App\RuneTime\Event;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class CalendarRepository
 * @package App\RuneTime\Event
 */
class CalendarRepository extends EloquentRepository
{
	/**
	 * @param Calendar $model
	 */
	public function __construct(Calendar $model)
	{
		$this->model = $model;
	}
}