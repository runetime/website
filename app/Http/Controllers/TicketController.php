<?php
namespace App\Http\Controllers;
class TicketController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('navbar.runetime.runetime');
		$this->title('Tickets');
		return $this->view('tickets.index');
	}

	public function getView($id) {
		$ticket = $this->tickets->getById($id);
		if(!$ticket)
			\App::abort(404);
		$this->nav('navbar.runetime.runetime');
		$this->title('Tickets');
		return $this->view('tickets.index');
	}

	public function getCreate() {
		$this->nav('navbar.runetime.runetime');
		$this->title('Tickets');
		return $this->view('tickets.index');
	}

	public function postCreate() {

	}

	public function getManageIndex() {
		$this->nav('navbar.runetime.runetime');
		$this->title('Tickets');
		return $this->view('tickets.index');
	}
}