<?php
use RT\Chat\Action;
use RT\Chat\ActionRepository;
use RT\Chat\Chat;
use RT\Chat\ChatRepository;
class ChatController extends BaseController{
	private $actions;
	private $chat;
	public function __construct(ActionRepository $actions,ChatRepository $chat){
		$this->actions=$actions;
		$this->chat=$chat;
	}
	public function getStart(){
//		$messages=$this->chat->getX(Chat::PER_PAGE);
//		$messages=$this->chat->encode($messages);
		$messages=[
			1=>[
				'author_name'=>'Runis',
				'contents'=>'[b]Hi[/b]',
				'contents_parsed'=>'<b>Hi!</b>',
				'status'=>0,
				'created_at'=>1411361333,
			],
			2=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
		];
		header('Content-Type: application/json');
		return json_encode($messages);
	}
	public function getUpdate($since){
		// idk yet
	}
	public function postMessage(){
		$message=Input::get('message');
		$response=[
			'sent'=>true,
		];
		header('Content-Type: application/json');
		return json_encode($response);
	}
	public function postStatusChange(){
		$msgId=Input::get('msgId');
		$newStatus=Input::get('newStatus');
	}
}