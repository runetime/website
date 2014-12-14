<?php
namespace App\RuneTime\Event;
use App\Runis\Core\EloquentRepository;
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