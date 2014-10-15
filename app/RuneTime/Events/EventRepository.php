<?php
namespace App\RuneTime\Event;
use App\Runis\Core\EloquentRepository;
class EventRepository extends EloquentRepository{
	public function __construct(Event $model){
		$this->model=$model;
	}
}