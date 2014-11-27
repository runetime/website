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
		$ticketList = [Ticket::STATUS_CLOSED => [], Ticket::STATUS_OPEN => []];
		foreach($tickets as $ticket)
			array_push($ticketList[$ticket->status], $ticket);
		$this->nav('navbar.runetime.runetime');
		$this->title('Tickets');
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
			\App::abort(404);
		if($ticket->author->id !== \Auth::user()->id || !\Auth::user()->isStaff())
			\App::abort(403);
		$posts = $ticket->posts;
		$this->bc(['tickets' => 'Tickets']);
		$this->nav('navbar.runetime.runetime');
		$this->title($ticket->name);
		return $this->view('tickets.view', compact('ticket', 'posts'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCreate() {
		$this->bc(['tickets' => 'Tickets']);
		$this->nav('navbar.runetime.runetime');
		$this->title('Creating a Ticket');
		return $this->view('tickets.create');
	}

	/**
	 * @param CreateTicketRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(CreateTicketRequest $form) {
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$ticket = new Ticket;
		$ticket = $ticket->saveNew(\Auth::user()->id, $form->name, 0, 0, Ticket::STATUS_OPEN);
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $contentsParsed);
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
			\App::abort(404);
		if($ticket->author->id !== \Auth::user()->id || !\Auth::user()->isStaff())
			\App::abort(403);
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		$ticket->addPost($post);
		return \redirect()->to('/tickets/' . \String::slugEncode($ticket->id, $ticket->name));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getManageIndex() {
		$ticketsOpen = $this->tickets->getAllByStatus(Ticket::STATUS_OPEN);
		$ticketsClosed = $this->tickets->getXByStatus(Ticket::PER_PAGE, Ticket::STATUS_CLOSED);
		$this->bc(['tickets' => 'Tickets']);
		$this->nav('navbar.staff.staff');
		$this->title('Manage Tickets');
		return $this->view('tickets.manage.index', compact('ticketsOpen', 'ticketsClosed'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getStatusSwitch($id) {
		$ticket = $this->tickets->getById($id);
		if(!$ticket)
			\App::abort(404);
		$ticket->statusSwitch();
		return \redirect()->to('/tickets/manage');
	}
}