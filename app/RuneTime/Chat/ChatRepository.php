<?php
namespace App\RuneTime\Chat;
use App\Runis\Core\EloquentRepository;
class ChatRepository extends EloquentRepository{
	public function __construct(Chat $model){
		$this->model=$model;
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
	public function getX($amount){
		return $this->model->
			orderBy('id','desc')->
			take($amount)->
			get();
	}
	public function getByCreatedAt($time){
		return $this->model->
			where('created_at','>',$time)->
			get();
	}
	public function getByChannel($channelId,$amount){
		return $this->model->
			where('channel','=',$channelId)->
			orderBy('id','desc')->
			take($amount)->
			get();
	}
	public function getLatestByChannel($channelId){
		return $this->model->
			where('channel','=',$channelId)->
			orderBy('id','desc')->
			first();
	}
}