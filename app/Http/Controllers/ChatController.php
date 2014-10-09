<?php
namespace App\Http\Controllers;
use App\Http\Requests\ChatMessageForm;
use App\Http\Requests\ChatUpdateForm;
use App\Http\Requests\ChatStartForm;
use App\Http\Requests\ChatCheckChannelForm;
use App\RuneTime\BBCode\BBCodeRepository;
use App\RuneTime\Chat\Action;
use App\RuneTime\Chat\ActionRepository;
use App\RuneTime\Chat\ChannelRepository;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;
use App\Runis\Accounts\UserRepository;
use App\Utilities\Time;
class ChatController extends BaseController{
	private $actions;
	private $bbcode;
	private $channels;
	private $chat;
	private $users;
	public function __construct(ActionRepository $actions,BBCodeRepository $bbcode,ChannelRepository $channels,ChatRepository $chat,UserRepository $users){
		$this->actions=$actions;
		$this->bbcode=$bbcode;
		$this->channels=$channels;
		$this->chat=$chat;
		$this->users=$users;
	}
	public function postStart(ChatStartForm $form){
		$channel=$this->channels->getByNameTrim($form->input('channel'));
		$messages=$this->chat->getByChannel($channel->id,Chat::PER_PAGE);
		$messageList=[];
		$users=[];
		foreach($messages as $message){
			$messageCurrent=new \stdClass;
			if(!isset($users[$message->author_id])){
				$users[$message->author_id]=$this->users->getById($message->author_id);
			}
			$messageCurrent->author_name=$users[$message->author_id]->display_name;
			$messageCurrent->contents_parsed=$message->contents_parsed;
			$messageCurrent->created_at=strtotime($message->created_at);
			$messageCurrent->uuid=uniqid('',true);
			array_push($messageList,$messageCurrent);
		}
		header('Content-Type: application/json');
		return json_encode(array_reverse($messageList));
	}
	public function postUpdate(ChatUpdateForm $form){
		$delta=$form->input('delta');
		$messages=$this->chat->getByCreatedAt(Time::formatTime(time()-$delta));
		$messageList=[];
		$users=[];
		foreach($messages as $message){
			$messageCurrent=new \stdClass;
			if(!isset($users[$message->author_id])){
				$users[$message->author_id]=$this->users->getById($message->author_id);
			}
			$messageCurrent->author_name=$users[$message->author_id]->display_name;
			$messageCurrent->contents_parsed=$message->contents_parsed;
			$messageCurrent->created_at=strtotime($message->created_at);
			$messageCurrent->uuid=uniqid('',true);
			array_push($messageList,$messageCurrent);
		}
		header('Content-Type: application/json');
		return json_encode(array_reverse($messageList));
	}
	public function postMessage(ChatMessageForm $form){
		if(\Auth::check()){
			$channel=$this->channels->getByNameTrim($form->input('channel'));
			$chat=new Chat;
			$chat->author_id=\Auth::user()->id;
			$chat->contents=$form->input('contents');
			$chat->contents_parsed=$this->bbcode->parse($form->input('contents'));
			$chat->status=Chat::STATUS_USER_PUBLISHED;
			$chat->channel=$channel->id;
			$chat->save();
			$channel=$this->channels->getByNameTrim($form->input('channel'));
			$channel->messages=$channel->messages+1;
			$channel->save();
			$response=[
				'sent'=>true,
			];
		}
		else{
			$response=[
				'sent'=>false,
			];
		}
		header('Content-Type: application/json');
		return json_encode($response);
	}
	public function postStatusChange(){
	}
	public function getChannels(){
		$channels=$this->channels->getAll();
		$channelList=[];
		foreach($channels as $channel){
			$message=$this->chat->getLatestByChannel($channel->id);
			$channelCurrent=new \stdClass;
			$channelCurrent->name=$channel->name_trim;
			$channelCurrent->messages=$channel->messages;
			$channelCurrent->last_message=strtotime(
				$message['created_at']);
			array_push($channelList,$channelCurrent);
		}
		header('Content-Type: application/json');
		return json_encode(array_reverse($channelList));
	}
	public function postCheckChannel(ChatCheckChannelForm $form){
		$channel=$this->channels->getByNameTrim($form->input('channel'));
		$response=[];
		if($channel){
			$response['valid']=true;
		}
		else{
			$response['valid']=false;
		}
		header('Content-Type: application/json');
		return $response;
	}
}