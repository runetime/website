<?php
namespace App\Http\Controllers;
use App\Http\Requests\Tickets\CreateReplyRequest;
use App\Http\Requests\Tickets\CreateTicketRequest;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Tickets\Ticket;
use App\RuneTime\Tickets\TicketRepository;
class TicketController extends BaseController {
	/**
	 * @var TicketRepository
	 */
	private $tickets;

	/**
	 * @param TicketRepository $tickets
	 */
	public function __construct(TicketRepository $tickets) {
		$this->tickets = $tickets;
	}
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$tickets = $this->tickets->getByAuthor(\Auth::user()->id);
		$ticketList = [Ticket::STATUS_OPEN => [], Ticket::STATUS_CLOSED => [], Ticket::STATUS_ESCALATED => []];
		foreach($tickets as $ticket) {
			if($ticket->status === Ticket::STATUS_CLOSED)
				array_push($ticketList[$ticket->status], $ticket);
			else
				array_push($ticketList[Ticket::STATUS_OPEN], $ticket);
		}
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('tickets.title'));
		return $this->view('tickets.index', compact('ticketList'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getView($id) {
		$ticket = $this->tickets->getById($id);
		if(!$ticket)
			return \Error::abort(404);
		if(!($ticket->author->id === \Auth::user()->id || \Auth::user()->isStaff()))
			return \Error::abort(403);
		if($ticket->status == TICKET::STATUS_ESCALATED && !\Auth::user()->isAdmin())
			return \Error::abort(403);
		$posts = $ticket->posts;
		$this->bc(['tickets' => trans('tickets.title')]);
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('tickets.view.title', ['name' => $ticket->name]));
		return $this->view('tickets.view', compact('ticket', 'posts'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCreate() {
		$this->bc(['tickets' => trans('tickets.title')]);
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('tickets.create.title'));
		return $this->view('tickets.create');
	}

	/**
	 * @param CreateTicketRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(CreateTicketRequest $form) {
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$ticket = with(new Ticket)->saveNew(\Auth::user()->id, $form->name, 0, 0, Ticket::STATUS_OPEN);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $contentsParsed);
		$ticket->last_post = $post->id;
		$ticket->save();
		$ticket->addPost($post);
		return \redirect()->to('/tickets/' . \String::slugEncode($ticket->id, $ticket->name));
	}

	/**
	 * @param                    $id
	 * @param CreateReplyRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply($id, CreateReplyRequest $form) {
		$ticket = $this->tickets->getById($id);
		if(!$ticket)
			return \Error::abort(404);
		if(!($ticket->author->id === \Auth::user()->id || \Auth::user()->isStaff()))
			return \Error::abort(403);
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		$ticket->addPost($post);
		return \redirect()->to('/tickets/' . \String::slugEncode($ticket->id, $ticket->name));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getManageIndex() {
		$ticketsOpen = $this->tickets->getAllByStatus(Ticket::STATUS_OPEN);
		$ticketsClosed = $this->tickets->getXByStatus(Ticket::PER_PAGE, Ticket::STATUS_CLOSED);
		$ticketsEscalated = [];
		if(\Auth::user()->isAdmin())
			$ticketsEscalated = $this->tickets->getAllByStatus(Ticket::STATUS_ESCALATED);
		$this->bc(['tickets' => trans('tickets.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trans('tickets.manage.title'));
		return $this->view('tickets.manage.index', compact('ticketsOpen', 'ticketsClosed', 'ticketsEscalated'));
	}

	/**
	 * @param $id
	 * @param $status
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getStatusSwitch($id, $status) {
		$ticket = $this->tickets->getById($id);
		if(!$ticket)
			\App::abort(404);
		$ticket->status = $status;
		$ticket->save();
		return \redirect()->to('/tickets/manage');
	}
}