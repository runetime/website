<?php
use RT\Events\EventRepository;
class CalendarController extends BaseController{
	public function __construct(EventRepository $events){
		$this->events=$events;
	}
	public function getIndex(){

	}
}
