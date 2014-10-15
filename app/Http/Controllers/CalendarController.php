<?php
namespace App\Http\Controllers;
use App\RuneTime\Events\EventRepository;
class CalendarController extends BaseController {
	/**
	 * @param EventRepository $events
	 */
	public function __construct(EventRepository $events) {
		$this->events = $events;
	}

	/**
	 *
	 */
	public function getIndex() {
	}
}