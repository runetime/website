<?php
namespace App\RuneTime\Event;
use App\Runis\Core\EloquentRepository;
class CalendarRepository extends EloquentRepository{
	public function __construct(Calendar $model){
		$this->model=$model;
	}
}