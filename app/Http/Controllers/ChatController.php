<?php
namespace App\Http\Controllers;

use App\Http\Requests\Chat\CheckChannelRequest;
use App\Http\Requests\Chat\MessageRequest;
use App\Http\Requests\Chat\StartRequest;
use App\Http\Requests\Chat\StatusChangeRequest;
use App\Http\Requests\Chat\UpdateRequest;
use App\RuneTime\Bans\MuteRepository;
use App\RuneTime\Chat\ActionRepository;
use App\RuneTime\Chat\ChannelRepository;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;
use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Chat\FilterRepository;

/**
 * Class ChatController
 * @package App\Http\Controllers
 */
class ChatController extends Controller
{
	/**
	 * @var FilterRepository
	 */
	private $filters;
	/**
	 * @var ActionRepository
	 */
	private $actions;
	/**
	 * @var ChannelRepository
	 */
	private $channels;
	/**
	 * @var ChatRepository
	 */
	private $chat;
	/**
	 * @var MuteRepository
	 */
	private $mutes;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param \App\RuneTime\Chat\ActionRepository   $actions
	 * @param \App\RuneTime\Chat\ChannelRepository  $channels
	 * @param \App\RuneTime\Chat\ChatRepository     $chat
	 * @param \App\RuneTime\Chat\FilterRepository   $filters
	 * @param \App\RuneTime\Bans\MuteRepository     $mutes
	 * @param \App\RuneTime\Accounts\UserRepository $users
	 */
	public function __construct(
		ActionRepository $actions,
		ChannelRepository $channels,
		ChatRepository $chat,
		FilterRepository $filters,
		MuteRepository $mutes,
		UserRepository $users
	) {
		$this->actions = $actions;
		$this->channels = $channels;
		$this->chat = $chat;
		$this->filters = $filters;
		$this->mutes = $mutes;
		$this->users = $users;
	}

	/**
	 * @return string
	 */
	public function getChannels()
	{
		$channels = $this->channels->getAll();
		$channelList = [];
		foreach($channels as $channel) {
			$message = $this->chat->getLatestByChannel($channel->id);
			$channelCurrent = (object) [
				'name'         => $channel->name_trim,
				'messages'     => $channel->messages,
				'last_message' => strtotime($message['created_at']),
			];
			array_push($channelList, $channelCurrent);
		}

		return json_encode(array_reverse($channelList));
	}

	/**
	 * @param CheckChannelRequest $form
	 *
	 * @return array
	 */
	public function postCheckChannel(CheckChannelRequest $form)
	{
		$channel = $this->channels->getByNameTrim($form->channel);
		$response = ['valid' => false];
		if(!empty($channel)) {
			$response['valid'] = true;
		}

		return json_encode($response);
	}

	/**
	 * @param MessageRequest $form
	 *
	 * @return string
	 */
	public function postMessage(MessageRequest $form)
	{
		$response = ['done' => false];
		if(\Auth::check()){
			$mute = $this->mutes->getByUserActive(\Auth::user()->id);
			if(!empty($mute)) {
				$response['error'] = -2;
			} else {
				$status = Chat::STATUS_VISIBLE;
				$contents = $form->contents;
				if(\Auth::user()->isStaff()) {
					if(\String::startsWith("/pin ", $contents)) {
						$contents = \String::replaceFirst("/pin ", $contents);
						$status = Chat::STATUS_PINNED;
					} elseif(\String::startsWith("/hide ", $contents)) {
						$contents = \String::replaceFirst("/hide ", $contents);
						$status = Chat::STATUS_INVISIBLE;
					} elseif(\String::startsWith("/hid ", $contents)) {
						$contents = \String::replaceFirst("/hid ", $contents);
						$status = Chat::STATUS_INVISIBLE;
					} elseif(\String::startsWith("/pinhid ", $contents)) {
						$contents = \String::replaceFirst("/pinhid ", $contents);
						$status = Chat::STATUS_PINNED_INVISIBLE;
					} elseif(\String::startsWith("/hidpin ", $contents)) {
						$contents = \String::replaceFirst("/hidpin ", $contents);
						$status = Chat::STATUS_PINNED_INVISIBLE;
					}
				}

				$contentsParsed = with(new \Parsedown)->text($contents);

				$filters = $this->filters->getAll();
				foreach($filters as $filter) {
					$asterisks = str_repeat('*', strlen($filter->text));
					$contentsParsed = str_ireplace($filter->text, $asterisks, $contentsParsed);
				}

				with(new Chat)->saveNew(\Auth::user()->id, $form->contents, $contentsParsed, $status, $this->channels->getByNameTrim($form->channel)->id);
				$channel = $this->channels->getByNameTrim($form->channel);
				$channel->messages = $channel->messages + 1;
				$channel->save();

				$response['done'] = true;
			}
		} else {
			$response['error'] = -1;
		}

		return json_encode($response);
	}

	/**
	 * @return string
	 */
	public function getModerator()
	{
		$response = ['mod' => false];
		if(\Auth::check() && \Auth::user()->isCommunity()) {
			$response['mod'] = true;
		}

		return json_encode($response);
	}

	/**
	 * @return mixed
	 */
	public function getPinned()
	{
		if(\Auth::check() && \Auth::user()->isStaff()) {
			$messages = $this->chat->getByStatus(Chat::STATUS_PINNED, '>=');
		} else {
			$messages = $this->chat->getByStatus(Chat::STATUS_PINNED);
		}

		$messageList = $this->sortMessages($messages);
		return json_encode($messageList);
	}

	/**
	 * @param StartRequest $form
	 *
	 * @return string
	 */
	public function postStart(StartRequest $form)
	{
		$channel = $this->channels->getByNameTrim($form->channel);
		if(\Auth::check() && \Auth::user()->isStaff()) {
			$messages = $this->chat->getByChannel($channel->id, Chat::PER_PAGE, Chat::STATUS_VISIBLE, '>=');
		} else {
			$messages = $this->chat->getByChannel($channel->id, Chat::PER_PAGE, Chat::STATUS_VISIBLE);
		}

		$messageList = $this->sortMessages($messages);
		$messageList = array_reverse($messageList);

		if(\Auth::check() && \Auth::user()->isStaff()) {
			$pinned = $this->chat->getByStatus(Chat::STATUS_PINNED, '>=');
		} else {
			$pinned = $this->chat->getByStatus(Chat::STATUS_PINNED);
		}

		$pinnedList = $this->sortMessages($pinned);
		$res = (object) [
			'messages' => $messageList,
			'pinned'   => $pinnedList,
		];

		return json_encode($res);
	}

	/**
	 * @param StatusChangeRequest $form
	 *
	 * @return string
	 */
	public function postStatusChange(StatusChangeRequest $form)
	{
		$response = ['done' => false];
		$chat = $this->chat->getById($form->id);
		if(!empty($chat)) {
			$chat->status = $form->status;
			$chat->save();
			$response['done'] = true;
		} else {
			$response['error'] = -1;
		}

		return json_encode($response);
	}

	/**
	 * @param UpdateRequest $form
	 *
	 * @return string
	 */
	public function postUpdate(UpdateRequest $form)
	{
		if($form->id <= 0) {
			return json_encode([]);
		}

		if(\Auth::check() && \Auth::user()->isStaff()) {
			$messages = $this->chat->getAfterIdByStatus($form->id, $form->channel, Chat::STATUS_INVISIBLE, '<=');
		} else {
			$messages = $this->chat->getAfterIdByStatus($form->id, $form->channel, Chat::STATUS_VISIBLE);
		}

		$messageList = $this->sortMessages($messages);

		return json_encode(array_reverse($messageList));
	}

	/**
	 * @param $messages
	 *
	 * @return array
	 */
	private function sortMessages($messages)
	{
		$messageList = [];
		$users = [];
		foreach($messages as $message) {
			if(!isset($users[$message->author_id])) {
				$users[$message->author_id] = $this->users->getById($message->author_id);
			}

			$messageCurrent = (object) [
				'id'              => $message->id,
				'author_name'     => $users[$message->author_id]->display_name,
				'class_name'      => $message->author->importantRole()->class_name,
				'contents_parsed' => $message->contents_parsed,
				'created_at'      => strtotime($message->created_at),
				'uuid'            => uniqid(md5(microtime(true)), true),
				'status'          => $message->status,
			];
			array_push($messageList, $messageCurrent);
		}

		return $messageList;
	}
}