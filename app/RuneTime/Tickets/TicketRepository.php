<?php
namespace App\RuneTime\Tickets;
use App\Runis\Core\EloquentRepository;
class TicketRepository extends EloquentRepository {
	public function __construct(Ticket $model) {
		$this->model = $model;
	}
}