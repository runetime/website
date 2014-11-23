<?php
namespace App\Http\Controllers;

use App\Http\Requests\Statuses\StatusCreateRequest;
use App\Http\Requests\Statuses\StatusReplyRequest;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\Vote;
use App\RuneTime\Statuses\Status;
use App\RuneTime\Statuses\StatusRepository;
class StatusController extends BaseController {
	/**
	 * @var StatusRepository
	 */
	private $statuses;

	/**
	 * @param StatusRepository $statuses
	 */
	public function __construct(StatusRepository $statuses) {
		$this->statuses = $statuses;
	}
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$statusList = $this->statuses->getLatest(10);
		$this->bc(['forums' => 'Forums']);
		$this->nav('navbar.forums');
		$this->title('Latest Status Updates');
		return $this->view('forums.statuses.index', compact('statusList'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getView($id) {
		$status = $this->statuses->getById($id);
		if(!$status)
			\App::abort(404);
		$this->bc(['forums' => 'Forums', 'forums/statuses' => 'Status Updates']);
		$this->nav('navbar.forums');
		$this->title('Status Update by ' . $status->author->display_name);
		return $this->view('forums.statuses.view', compact('status'));
	}

	/**
	 * @param                    $id
	 * @param StatusReplyRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply($id, StatusReplyRequest $form) {
		$status = $this->statuses->getById($id);
		if(!$status)
			\App::abort(404);
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, 1, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		with(new Vote)->saveNew(\Auth::user()->id, $post->id, Vote::STATUS_UP);
		$status->addPost($post);

		// Notify author
		if($status->author->id !== \Auth::user()->id) {
			$notification = new Notification;
			$contents = \Link::name(\Auth::user()->id) . " has replied to your status update <a href='" . $status->toSlug() . "#post" . $post->id . "'>" . $status->title . "</a>.";
			$notification->saveNew($status->author->id, 'Statuses', $contents, Notification::STATUS_UNREAD);
		}
		return \redirect()->to($status->toSlug() . '#post' . $post->id);
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCreate() {
		$this->bc(['forums' => 'Forums', 'forums/statuses' => 'Status Updates']);
		$this->nav('navbar.forums');
		$this->title('Create a Status Update');
		return $this->view('forums.statuses.create');
	}

	/**
	 * @param StatusCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(StatusCreateRequest $form) {
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$status = new Status;
		$status = $status->saveNew(\Auth::user()->id, 0, Status::STATUS_PUBLISHED);
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, 1, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		with(new Vote)->saveNew(\Auth::user()->id, $post->id, Vote::STATUS_UP);
		$status->addPost($post);
		return \redirect()->to('/forums/statuses/' . \String::slugEncode($status->id, 'by', \Auth::user()->display_name));
	}
}