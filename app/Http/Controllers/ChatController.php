<?php
namespace App\Http\Controllers;

use App\Http\Requests\Chat\CheckChannelRequest;
use App\Http\Requests\Chat\MessageRequest;
use App\Http\Requests\Chat\StartRequest;
use App\Http\Requests\Chat\UpdateRequest;
use App\RuneTime\Chat\ActionRepository;
use App\RuneTime\Chat\ChannelRepository;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;
use App\Runis\Accounts\UserRepository;

/**
 * Class ChatController
 * @package App\Http\Controllers
 */
class ChatController extends BaseController{
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
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param ActionRepository  $actions
	 * @param ChannelRepository $channels
	 * @param ChatRepository    $chat
	 * @param UserRepository    $users
	 */
	public function __construct(ActionRepository $actions, ChannelRepository $channels, ChatRepository $chat, UserRepository $users){
		$this->actions = $actions;
		$this->channels = $channels;
		$this->chat = $chat;
		$this->users = $users;
	}

	/**
	 * @param StartRequest $form
	 *
	 * @return string
	 */
	public function postStart(StartRequest $form){
		$channel = $this->channels->getByNameTrim($form->channel);
		$messages = $this->chat->getByChannel($channel->id, Chat::PER_PAGE);
		$messageList = [];
		$users = [];
		foreach($messages as $message){
			$messageCurrent = new \stdClass;
			if(!isset($users[$message->author_id]))
				$users[$message->author_id]=$this->users->getById($message->author_id);
			$messageCurrent->id = $message->id;
			$messageCurrent->author_name = $users[$message->author_id]->display_name;
			$messageCurrent->contents_parsed = $message->contents_parsed;
			$messageCurrent->created_at = strtotime($message->created_at);
			$messageCurrent->class_name = $message->author->importantRole()->class_name;
			$messageCurrent->uuid = uniqid('', true);
			array_push($messageList, $messageCurrent);
		}
		return json_encode(array_reverse($messageList));
	}

	/**
	 * @param UpdateRequest $form
	 *
	 * @return string
	 */
	public function postUpdate(UpdateRequest $form){
		if($form->id <= 0)
			return json_encode([]);
		$messages = $this->chat->getAfterId($form->id, $form->channel);
		$messageList = [];
		$users = [];
		foreach($messages as $message){
			$messageCurrent = new \stdClass;
			if(!isset($users[$message->author_id]))
				$users[$message->author_id] = $this->users->getById($message->author_id);
			$messageCurrent->id = $message->id;
			$messageCurrent->author_name = $users[$message->author_id]->display_name;
			$messageCurrent->class_name = $message->author->importantRole()->class_name;
			$messageCurrent->contents_parsed = $message->contents_parsed;
			$messageCurrent->created_at = strtotime($message->created_at);
			$messageCurrent->uuid = uniqid(md5(microtime(true)), true);
			array_push($messageList, $messageCurrent);
		}
		return json_encode(array_reverse($messageList));
	}

	/**
	 * @param MessageRequest $form
	 *
	 * @return string
	 */
	public function postMessage(MessageRequest $form){
		$response = ['sent' => false];
		if(\Auth::check()){
			$contentsParsed = with(new \Parsedown)->text($form->contents);
			with(new Chat)->saveNew(\Auth::user()->id, $form->contents, $contentsParsed, Chat::STATUS_USER_PUBLISHED, $this->channels->getByNameTrim($form->channel)->id);
			$channel = $this->channels->getByNameTrim($form->channel);
			$channel->messages = $channel->messages+1;
			$channel->save();
			$response['sent'] = true;
		}
		return json_encode($response);
	}

	/**
	 * @return string
	 */
	public function getChannels(){
		$channels = $this->channels->getAll();
		$channelList = [];
		foreach($channels as $channel) {
			$message = $this->chat->getLatestByChannel($channel->id);
			$channelCurrent = new \stdClass;
			$channelCurrent->name = $channel->name_trim;
			$channelCurrent->messages = $channel->messages;
			$channelCurrent->last_message = strtotime($message['created_at']);
			array_push($channelList, $channelCurrent);
		}
		return json_encode(array_reverse($channelList));
	}

	/**
	 * @param CheckChannelRequest $form
	 *
	 * @return array
	 */
	public function postCheckChannel(CheckChannelRequest $form){
		$channel = $this->channels->getByNameTrim($form->channel);
		$response = ['valid' => false];
		if($channel)
			$response['valid'] = true;
		return json_encode($response);
	}
}