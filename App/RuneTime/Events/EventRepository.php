<?php
namespace App\RuneTime\Event;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class EventRepository
 * @package App\RuneTime\Event
 */
class EventRepository extends EloquentRepository
{
	/**
	 * @param Event $model
	 */
	public function __construct(Event $model)
	{
		$this->model = $model;
	}
}