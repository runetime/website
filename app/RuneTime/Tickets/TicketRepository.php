<?php
namespace App\RuneTime\Tickets;
use App\Runis\Core\EloquentRepository;
class TicketRepository extends EloquentRepository
{
	public function __construct(Ticket $model)
	{
		$this->model = $model;
	}

	/**
	 * @param $statusId
	 *
	 * @return mixed
	 */
	public function getAllByStatus($statusId)
	{
		return $this->model->
			where('status', '=', $statusId)->
			get();
	}

	/**
	 * @param int $amount
	 * @param     $statusId
	 *
	 * @return mixed
	 */
	public function getXByStatus($amount = Ticket::PER_PAGE, $statusId)
	{
		return $this->model->
			where('status', '=', $statusId)->
			take($amount)->
			get();
	}

	public function getByAuthor($id)
	{
		return $this->model->
			where('author_id', '=', $id)->
			get();
	}
}