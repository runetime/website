<?php
namespace App\Http\Controllers;
use App\RuneTime\Chat\Action;
use App\RuneTime\Chat\ActionRepository;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;
class ChatController extends BaseController{
	private $actions;
	private $chat;
	public function __construct(ActionRepository $actions,ChatRepository $chat){
		$this->actions=$actions;
		$this->chat=$chat;
	}
	public function postStart(){
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
			3=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			4=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			5=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			6=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			7=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			8=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			9=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			10=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			11=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			12=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			13=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			14=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			15=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			16=>[
				'author_name'=>'Runis',
				'contents'=>'Testing',
				'contents_parsed'=>'Testing',
				'status'=>1,
				'created_at'=>1411364153,
			],
			17=>[
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