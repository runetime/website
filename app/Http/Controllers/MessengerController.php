<?php
namespace App\Http\Controllers;

use App\Http\Requests\Messenger\CreateRequest;
use App\Http\Requests\Messenger\ReplyRequest;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Messenger\Message;
use App\RuneTime\Messenger\MessageRepository;
use App\RuneTime\Notifications\Notification;
use App\Runis\Accounts\UserRepository;

class MessengerController extends BaseController
{
	/**
	 * @var MessageRepository
	 */
	private $messages;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param MessageRepository $messages
	 * @param UserRepository    $users
	 */
	public function __construct(MessageRepository $messages, UserRepository $users)
	{
		$this->messages = $messages;
		$this->users = $users;
	}
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$messages = \Auth::user()->messages;

		$this->nav('navbar.forums');
		$this->title('messenger.title');
		return $this->view('messenger.index', compact('messages'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getView($id)
	{
		$message = $this->messages->getById($id);
		if(!$message) {
			\App::abort(404);
		}

		$posts = $message->posts;

		$this->bc(['messenger' => trans('messenger.title')]);
		$this->nav('navbar.forums');
		$this->title('messenger.view.title', ['name' => $message->title]);
		return $this->view('messenger.view', compact('message', 'posts'));
	}

	/**
	 * @param              $id
	 * @param ReplyRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply($id, ReplyRequest $form)
	{
		$message = $this->messages->getById($id);
		if(!$message) {
			return \App::abort(404);
		}

		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		$message->addPost($post);

		// Notifications
		foreach($message->users as $user) {
			if($user->id !== \Auth::user()->id) {
				$contents = \Link::name(\Auth::user()->id) . " has replied to the private message <a href='" . $message->toSlug() . "'>" . $message->title . "</a> you're a participant of.";
				with(new Notification)->saveNew($user->id, trans('messenger.title'), $contents, Notification::STATUS_UNREAD);
			}
		}

		return \redirect()->to('/messenger/' . \String::slugEncode($message->id, $message->title));
	}

	/**
	 * @param int $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getCreate($id = 0) {
		$to = '';
		if($id > 0) {
			$to = $this->users->getById($id);
			if(!$to) {
				$to = '';
			}
		}
		$this->bc(['messenger' => trans('messenger.title')]);
		$this->nav(trans('forums.title'));
		$this->title('messenger.create.title');
		return $this->view('messenger.compose.index', compact('to'));
	}

	/**
	 * @param CreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(CreateRequest $form)
	{
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$message = with(new Message)->saveNew(\Auth::user()->id, $form->title, 0, 0);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		$message->addPost($post);
		$message->addUser(\Auth::user());
		foreach(explode(", ", $form->participants) as $participant) {
			$participant = $this->users->getByDisplayName(($participant));
			if($participant) {
				$message->addUser($participant);
				$contents = \Link::name(\Auth::user()->id) . " has sent you a private message titled <a href='" . $message->toSlug() . "'>" . $message->title . "</a>.";
				with(new Notification)->saveNew($participant->id, trans('messenger.title'), $contents, Notification::STATUS_UNREAD);
			}
		}

		return \redirect()->to('/messenger/' . \String::slugEncode($message->id, $message->title));
	}
}