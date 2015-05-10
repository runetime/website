<?php
namespace App\RuneTime\Tickets;

use App\RuneTime\Core\EloquentRepository;

/**
 * Class TicketRepository
 * @package App\RuneTime\Tickets
 */
class TicketRepository extends EloquentRepository
{
	/**
	 * @param \App\RuneTime\Tickets\Ticket $model
	 */
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

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getByAuthor($id)
	{
		return $this->model->
			where('author_id', '=', $id)->
			get();
	}
}