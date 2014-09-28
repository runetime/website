<?php
namespace App\RuneTime\Chat;
use McCool\LaravelAutoPresenter\BasePresenter;
use App,Input,Str,Request;
class ChatPresenter extends BasePresenter{
	public function created_ago(){
		return $this->resource->
			created_at->
			diffForHumans();
	}
}